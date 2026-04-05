import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Int "mo:base/Int";
import Result "mo:base/Result";
import Option "mo:base/Option";

actor {

  type AppRole = { #teacher; #authority; #adminStaff; #superAdmin };
  type Priority = { #low; #medium; #high; #urgent };
  type Status = { #pending; #approved; #rejected; #completed; #notFulfilled; #received };

  type User = { email : Text; passwordHash : Text; name : Text; role : AppRole };
  type UserView = { email : Text; name : Text; role : AppRole };
  type AuthorityView = { email : Text; name : Text };
  type AdminStaffView = { email : Text; name : Text };
  type HistoryEntry = { actorEmail : Text; actorName : Text; timestamp : Int; status : Status; remarks : ?Text };

  type AppNotification = {
    recipientEmail : Text;
    requisitionId : Nat;
    message : Text;
    createdAt : Int;
    isRead : Bool;
  };

  // Legacy tuple (10 fields)
  type ReqTupleLegacy = (Text, Text, Text, Nat, Priority, Text, Text, Int, Status, [HistoryEntry]);
  // V2 tuple (12 fields: +category, +location)
  type ReqTupleV2 = (Text, Text, Text, Nat, Priority, Text, Text, Int, Status, [HistoryEntry], Text, Text);
  // V3 tuple (13 fields: +attachmentHash)
  type ReqTupleV3 = (Text, Text, Text, Nat, Priority, Text, Text, Int, Status, [HistoryEntry], Text, Text, ?Text);
  // V4 tuple (14 fields: +assignedAuthorityEmail)
  type ReqTupleV4 = (Text, Text, Text, Nat, Priority, Text, Text, Int, Status, [HistoryEntry], Text, Text, ?Text, ?Text);
  // V5 tuple (15 fields: +assignedAdminStaffEmail)
  type ReqTuple = (Text, Text, Text, Nat, Priority, Text, Text, Int, Status, [HistoryEntry], Text, Text, ?Text, ?Text, ?Text);

  type RequisitionView = {
    id : Nat;
    itemName : Text;
    description : Text;
    quantity : Nat;
    priority : Priority;
    dateNeeded : Text;
    teacherEmail : Text;
    teacherName : Text;
    createdAt : Int;
    status : Status;
    history : [HistoryEntry];
    category : Text;
    location : Text;
    attachmentHash : ?Text;
    assignedAuthorityEmail : ?Text;
    assignedAdminStaffEmail : ?Text;
  };

  type Session = { email : Text; name : Text; role : AppRole; createdAt : Int };
  type LoginResult = { sessionId : Text; name : Text; role : AppRole };

  // Stable serialization arrays (survive upgrades)
  stable var usersEntries : [(Text, User)] = [];
  stable var sessionsEntries : [(Text, Session)] = [];
  stable var requisitionsEntries : [(Nat, ReqTupleLegacy)] = [];
  stable var requisitionsEntriesV2 : [(Nat, ReqTupleV2)] = [];
  stable var requisitionsEntriesV3 : [(Nat, ReqTupleV3)] = [];
  stable var requisitionsEntriesV4 : [(Nat, ReqTupleV4)] = [];
  stable var requisitionsEntriesV5 : [(Nat, ReqTuple)] = [];
  stable var notificationsEntries : [AppNotification] = [];
  stable var nextReqId : Nat = 1;
  stable var sessionCounter : Nat = 0;

  func natHash(n : Nat) : Nat32 { Nat32.fromNat(n % 2_147_483_647) };

  // In-memory working state (transient — HashMaps are not stable types)
  transient var users : HashMap.HashMap<Text, User> = HashMap.fromIter(Iter.fromArray(usersEntries), 10, Text.equal, Text.hash);
  transient var sessions : HashMap.HashMap<Text, Session> = HashMap.fromIter(Iter.fromArray(sessionsEntries), 10, Text.equal, Text.hash);
  transient var requisitions : HashMap.HashMap<Nat, ReqTuple> = HashMap.fromIter(Iter.fromArray(requisitionsEntriesV5), 10, Nat.equal, natHash);
  transient var notificationStore : [AppNotification] = notificationsEntries;

  stable let adminEmail = "murtazatinwala@msbinstitute.com";

  func seedAdmin() {
    if (users.get(adminEmail) == null) {
      users.put(adminEmail, { email = adminEmail; passwordHash = "msb123"; name = "Administrator"; role = #superAdmin });
    };
  };
  seedAdmin();

  func makeSessionId() : Text {
    sessionCounter += 1;
    "sess-" # Int.toText(Time.now()) # "-" # Nat.toText(sessionCounter);
  };

  func getSession(sessionId : Text) : ?Session { sessions.get(sessionId) };

  func reqToView(id : Nat, t : ReqTuple) : RequisitionView {
    {
      id;
      itemName = t.0;
      description = t.1;
      teacherEmail = t.2;
      quantity = t.3;
      priority = t.4;
      dateNeeded = t.5;
      teacherName = t.6;
      createdAt = t.7;
      status = t.8;
      history = t.9;
      category = t.10;
      location = t.11;
      attachmentHash = t.12;
      assignedAuthorityEmail = t.13;
      assignedAdminStaffEmail = t.14;
    };
  };

  public func login(email : Text, password : Text) : async Result.Result<LoginResult, Text> {
    switch (users.get(email)) {
      case null { #err("Invalid credentials.") };
      case (?user) {
        if (user.passwordHash != password) { #err("Invalid credentials.") } else {
          let sid = makeSessionId();
          sessions.put(sid, { email = user.email; name = user.name; role = user.role; createdAt = Time.now() });
          #ok({ sessionId = sid; name = user.name; role = user.role });
        };
      };
    };
  };

  public func logout(sessionId : Text) : async () { sessions.delete(sessionId) };

  public query func validateSession(sessionId : Text) : async ?{ email : Text; name : Text; role : AppRole } {
    switch (sessions.get(sessionId)) {
      case null null;
      case (?s) ?{ email = s.email; name = s.name; role = s.role };
    };
  };

  public query func getAuthorities(sessionId : Text) : async Result.Result<[AuthorityView], Text> {
    switch (sessions.get(sessionId)) {
      case null { #err("Not authenticated.") };
      case (?_s) {
        let auths = Iter.toArray(
          Iter.map(
            Iter.filter(
              users.entries(),
              func((_, u) : (Text, User)) : Bool { u.role == #authority }
            ),
            func((_, u) : (Text, User)) : AuthorityView { { email = u.email; name = u.name } }
          )
        );
        #ok(auths);
      };
    };
  };

  public query func getAdminStaff(sessionId : Text) : async Result.Result<[AdminStaffView], Text> {
    switch (sessions.get(sessionId)) {
      case null { #err("Not authenticated.") };
      case (?_s) {
        let staff = Iter.toArray(
          Iter.map(
            Iter.filter(
              users.entries(),
              func((_, u) : (Text, User)) : Bool { u.role == #adminStaff }
            ),
            func((_, u) : (Text, User)) : AdminStaffView { { email = u.email; name = u.name } }
          )
        );
        #ok(staff);
      };
    };
  };

  public func createUser(sessionId : Text, email : Text, password : Text, name : Text, role : AppRole) : async Result.Result<(), Text> {
    switch (getSession(sessionId)) {
      case null { #err("Not authenticated.") };
      case (?s) {
        if (s.role != #superAdmin) return #err("Only super admin can create users.");
        if (users.get(email) != null) return #err("User already exists.");
        users.put(email, { email; passwordHash = password; name; role });
        #ok(());
      };
    };
  };

  public func updateUser(sessionId : Text, email : Text, newPassword : ?Text, newName : ?Text, newRole : ?AppRole) : async Result.Result<(), Text> {
    switch (getSession(sessionId)) {
      case null { #err("Not authenticated.") };
      case (?s) {
        if (s.role != #superAdmin) return #err("Only super admin can update users.");
        switch (users.get(email)) {
          case null { #err("User not found.") };
          case (?u) {
            users.put(email, { email = u.email; passwordHash = Option.get(newPassword, u.passwordHash); name = Option.get(newName, u.name); role = Option.get(newRole, u.role) });
            #ok(());
          };
        };
      };
    };
  };

  public func deleteUser(sessionId : Text, email : Text) : async Result.Result<(), Text> {
    switch (getSession(sessionId)) {
      case null { #err("Not authenticated.") };
      case (?s) {
        if (s.role != #superAdmin) return #err("Only super admin can delete users.");
        if (email == adminEmail) return #err("Cannot delete super admin.");
        users.delete(email);
        #ok(());
      };
    };
  };

  public query func listUsers(sessionId : Text) : async Result.Result<[UserView], Text> {
    switch (sessions.get(sessionId)) {
      case null { #err("Not authenticated.") };
      case (?s) {
        if (s.role != #superAdmin) return #err("Only super admin can list users.");
        #ok(Iter.toArray(Iter.map(users.entries(), func((_, u) : (Text, User)) : UserView { { email = u.email; name = u.name; role = u.role } })));
      };
    };
  };

  public func createRequisition(
    sessionId : Text,
    itemName : Text,
    description : Text,
    quantity : Nat,
    priority : Priority,
    dateNeeded : Text,
    category : Text,
    location : Text,
    attachmentHash : ?Text,
    assignedAuthorityEmail : ?Text
  ) : async Result.Result<Nat, Text> {
    switch (getSession(sessionId)) {
      case null { #err("Not authenticated.") };
      case (?s) {
        if (s.role != #teacher and s.role != #authority) return #err("Only teachers and authority can submit requisitions.");
        let id = nextReqId;
        nextReqId += 1;
        let now = Time.now();
        let entry : HistoryEntry = { actorEmail = s.email; actorName = s.name; timestamp = now; status = #pending; remarks = null };
        requisitions.put(id, (itemName, description, s.email, quantity, priority, dateNeeded, s.name, now, #pending, [entry], category, location, attachmentHash, assignedAuthorityEmail, null));
        #ok(id);
      };
    };
  };

  public query func getMyRequisitions(sessionId : Text) : async Result.Result<[RequisitionView], Text> {
    switch (sessions.get(sessionId)) {
      case null { #err("Not authenticated.") };
      case (?s) {
        let all = Iter.toArray(Iter.map(requisitions.entries(), func((id, t) : (Nat, ReqTuple)) : RequisitionView { reqToView(id, t) }));
        let filtered = if (s.role == #teacher or s.role == #authority) { Array.filter(all, func(r : RequisitionView) : Bool { r.teacherEmail == s.email }) } else { all };
        #ok(filtered);
      };
    };
  };

  public query func getAllRequisitions(sessionId : Text) : async Result.Result<[RequisitionView], Text> {
    switch (sessions.get(sessionId)) {
      case null { #err("Not authenticated.") };
      case (?s) {
        if (s.role == #teacher) return #err("Teachers cannot view all requisitions.");
        let all = Iter.toArray(Iter.map(requisitions.entries(), func((id, t) : (Nat, ReqTuple)) : RequisitionView { reqToView(id, t) }));
        if (s.role == #authority) {
          let filtered = Array.filter(all, func(r : RequisitionView) : Bool {
            switch (r.assignedAuthorityEmail) {
              case null { true };
              case (?ae) { ae == s.email };
            };
          });
          return #ok(filtered);
        };
        #ok(all);
      };
    };
  };

  public func assignAdminStaff(sessionId : Text, id : Nat, adminStaffEmail : Text) : async Result.Result<(), Text> {
    switch (getSession(sessionId)) {
      case null { #err("Not authenticated.") };
      case (?s) {
        if (s.role != #authority) return #err("Only authority can assign admin staff.");
        switch (requisitions.get(id)) {
          case null { #err("Requisition not found.") };
          case (?t) {
            switch (users.get(adminStaffEmail)) {
              case null { #err("Admin staff user not found.") };
              case (?u) {
                if (u.role != #adminStaff) return #err("User is not an admin staff member.");
                requisitions.put(id, (t.0, t.1, t.2, t.3, t.4, t.5, t.6, t.7, t.8, t.9, t.10, t.11, t.12, t.13, ?adminStaffEmail));
                let notif : AppNotification = {
                  recipientEmail = adminStaffEmail;
                  requisitionId = id;
                  message = "You have been assigned requisition #" # Nat.toText(id) # ": " # t.0;
                  createdAt = Time.now();
                  isRead = false;
                };
                notificationStore := Array.append(notificationStore, [notif]);
                #ok(());
              };
            };
          };
        };
      };
    };
  };

  public query func getNotifications(sessionId : Text) : async Result.Result<[AppNotification], Text> {
    switch (sessions.get(sessionId)) {
      case null { #err("Not authenticated.") };
      case (?s) {
        let myNotifs = Array.filter(notificationStore, func(n : AppNotification) : Bool { n.recipientEmail == s.email });
        #ok(myNotifs);
      };
    };
  };

  public func markNotificationsRead(sessionId : Text) : async Result.Result<(), Text> {
    switch (getSession(sessionId)) {
      case null { #err("Not authenticated.") };
      case (?s) {
        notificationStore := Array.map(notificationStore, func(n : AppNotification) : AppNotification {
          if (n.recipientEmail == s.email) {
            { recipientEmail = n.recipientEmail; requisitionId = n.requisitionId; message = n.message; createdAt = n.createdAt; isRead = true }
          } else { n }
        });
        #ok(());
      };
    };
  };

  public func approveRequisition(sessionId : Text, id : Nat, remarks : ?Text) : async Result.Result<(), Text> {
    switch (getSession(sessionId)) {
      case null { #err("Not authenticated.") };
      case (?s) {
        if (s.role != #authority) return #err("Only authority can approve.");
        switch (requisitions.get(id)) {
          case null { #err("Requisition not found.") };
          case (?t) {
            if (t.8 != #pending) return #err("Only pending requisitions can be approved.");
            let entry : HistoryEntry = { actorEmail = s.email; actorName = s.name; timestamp = Time.now(); status = #approved; remarks };
            requisitions.put(id, (t.0, t.1, t.2, t.3, t.4, t.5, t.6, t.7, #approved, Array.append(t.9, [entry]), t.10, t.11, t.12, t.13, t.14));
            #ok(());
          };
        };
      };
    };
  };

  public func rejectRequisition(sessionId : Text, id : Nat, remarks : Text) : async Result.Result<(), Text> {
    switch (getSession(sessionId)) {
      case null { #err("Not authenticated.") };
      case (?s) {
        if (s.role != #authority) return #err("Only authority can reject.");
        switch (requisitions.get(id)) {
          case null { #err("Requisition not found.") };
          case (?t) {
            if (t.8 != #pending) return #err("Only pending requisitions can be rejected.");
            let entry : HistoryEntry = { actorEmail = s.email; actorName = s.name; timestamp = Time.now(); status = #rejected; remarks = ?remarks };
            requisitions.put(id, (t.0, t.1, t.2, t.3, t.4, t.5, t.6, t.7, #rejected, Array.append(t.9, [entry]), t.10, t.11, t.12, t.13, t.14));
            #ok(());
          };
        };
      };
    };
  };

  public func fulfillRequisition(sessionId : Text, id : Nat) : async Result.Result<(), Text> {
    switch (getSession(sessionId)) {
      case null { #err("Not authenticated.") };
      case (?s) {
        if (s.role != #adminStaff and s.role != #superAdmin) return #err("Only admin staff can fulfill.");
        switch (requisitions.get(id)) {
          case null { #err("Requisition not found.") };
          case (?t) {
            if (t.8 != #approved) return #err("Only approved requisitions can be fulfilled.");
            // If an admin staff is assigned, only they can complete it (superAdmin bypass)
            switch (t.14) {
              case (?assigned) {
                if (s.role == #adminStaff and s.email != assigned) {
                  return #err("Only the assigned admin staff can complete this requisition.");
                };
              };
              case null {};
            };
            let entry : HistoryEntry = { actorEmail = s.email; actorName = s.name; timestamp = Time.now(); status = #completed; remarks = null };
            requisitions.put(id, (t.0, t.1, t.2, t.3, t.4, t.5, t.6, t.7, #completed, Array.append(t.9, [entry]), t.10, t.11, t.12, t.13, t.14));
            #ok(());
          };
        };
      };
    };
  };

  public func markNotFulfilled(sessionId : Text, id : Nat, remarks : Text) : async Result.Result<(), Text> {
    switch (getSession(sessionId)) {
      case null { #err("Not authenticated.") };
      case (?s) {
        if (s.role != #adminStaff and s.role != #superAdmin) return #err("Only admin staff can mark not fulfilled.");
        switch (requisitions.get(id)) {
          case null { #err("Requisition not found.") };
          case (?t) {
            if (t.8 != #approved) return #err("Only approved requisitions can be marked not fulfilled.");
            // If an admin staff is assigned, only they can mark not fulfilled (superAdmin bypass)
            switch (t.14) {
              case (?assigned) {
                if (s.role == #adminStaff and s.email != assigned) {
                  return #err("Only the assigned admin staff can mark this requisition as not fulfilled.");
                };
              };
              case null {};
            };
            let entry : HistoryEntry = { actorEmail = s.email; actorName = s.name; timestamp = Time.now(); status = #notFulfilled; remarks = ?remarks };
            requisitions.put(id, (t.0, t.1, t.2, t.3, t.4, t.5, t.6, t.7, #notFulfilled, Array.append(t.9, [entry]), t.10, t.11, t.12, t.13, t.14));
            #ok(());
          };
        };
      };
    };
  };

  public func markReceived(sessionId : Text, id : Nat) : async Result.Result<(), Text> {
    switch (getSession(sessionId)) {
      case null { #err("Not authenticated.") };
      case (?s) {
        if (s.role != #teacher and s.role != #authority) return #err("Only teachers and authority can mark as received.");
        switch (requisitions.get(id)) {
          case null { #err("Requisition not found.") };
          case (?t) {
            if (t.2 != s.email) return #err("You can only mark your own requisitions as received.");
            if (t.8 != #completed) return #err("Only completed requisitions can be marked as received.");
            let entry : HistoryEntry = { actorEmail = s.email; actorName = s.name; timestamp = Time.now(); status = #received; remarks = null };
            requisitions.put(id, (t.0, t.1, t.2, t.3, t.4, t.5, t.6, t.7, #received, Array.append(t.9, [entry]), t.10, t.11, t.12, t.13, t.14));
            #ok(());
          };
        };
      };
    };
  };

  system func preupgrade() {
    usersEntries := Iter.toArray(users.entries());
    sessionsEntries := Iter.toArray(sessions.entries());
    requisitionsEntriesV5 := Iter.toArray(requisitions.entries());
    notificationsEntries := notificationStore;
    requisitionsEntriesV4 := [];
    requisitionsEntriesV3 := [];
    requisitionsEntriesV2 := [];
    requisitionsEntries := [];
  };

  system func postupgrade() {
    users := HashMap.fromIter(Iter.fromArray(usersEntries), 10, Text.equal, Text.hash);
    sessions := HashMap.fromIter(Iter.fromArray(sessionsEntries), 10, Text.equal, Text.hash);
    let legacyMigrated = Array.map<(Nat, ReqTupleLegacy), (Nat, ReqTuple)>(requisitionsEntries, func((id, t) : (Nat, ReqTupleLegacy)) : (Nat, ReqTuple) {
      (id, (t.0, t.1, t.2, t.3, t.4, t.5, t.6, t.7, t.8, t.9, "", "", null, null, null))
    });
    let v2Migrated = Array.map<(Nat, ReqTupleV2), (Nat, ReqTuple)>(requisitionsEntriesV2, func((id, t) : (Nat, ReqTupleV2)) : (Nat, ReqTuple) {
      (id, (t.0, t.1, t.2, t.3, t.4, t.5, t.6, t.7, t.8, t.9, t.10, t.11, null, null, null))
    });
    let v3Migrated = Array.map<(Nat, ReqTupleV3), (Nat, ReqTuple)>(requisitionsEntriesV3, func((id, t) : (Nat, ReqTupleV3)) : (Nat, ReqTuple) {
      (id, (t.0, t.1, t.2, t.3, t.4, t.5, t.6, t.7, t.8, t.9, t.10, t.11, t.12, null, null))
    });
    let v4Migrated = Array.map<(Nat, ReqTupleV4), (Nat, ReqTuple)>(requisitionsEntriesV4, func((id, t) : (Nat, ReqTupleV4)) : (Nat, ReqTuple) {
      (id, (t.0, t.1, t.2, t.3, t.4, t.5, t.6, t.7, t.8, t.9, t.10, t.11, t.12, t.13, null))
    });
    let combined = Array.append(Array.append(Array.append(Array.append(legacyMigrated, v2Migrated), v3Migrated), v4Migrated), requisitionsEntriesV5);
    requisitions := HashMap.fromIter(Iter.fromArray(combined), 10, Nat.equal, natHash);
    notificationStore := notificationsEntries;
    usersEntries := [];
    sessionsEntries := [];
    requisitionsEntries := [];
    requisitionsEntriesV2 := [];
    requisitionsEntriesV3 := [];
    requisitionsEntriesV4 := [];
    requisitionsEntriesV5 := [];
    notificationsEntries := [];
    seedAdmin();
  };
};
