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

persistent actor {

  type AppRole = { #teacher; #authority; #adminStaff; #superAdmin };
  type Priority = { #low; #medium; #high; #urgent };
  type Status = { #pending; #approved; #rejected; #completed; #notFulfilled };

  type User = { email : Text; passwordHash : Text; name : Text; role : AppRole };
  type UserView = { email : Text; name : Text; role : AppRole };
  type HistoryEntry = { actorEmail : Text; actorName : Text; timestamp : Int; status : Status; remarks : ?Text };
  type ReqTupleLegacy = (Text, Text, Text, Nat, Priority, Text, Text, Int, Status, [HistoryEntry]);
  type ReqTuple = (Text, Text, Text, Nat, Priority, Text, Text, Int, Status, [HistoryEntry], Text, Text);
  type RequisitionView = { id : Nat; itemName : Text; description : Text; quantity : Nat; priority : Priority; dateNeeded : Text; teacherEmail : Text; teacherName : Text; createdAt : Int; status : Status; history : [HistoryEntry]; category : Text; location : Text };
  type Session = { email : Text; name : Text; role : AppRole; createdAt : Int };
  type LoginResult = { sessionId : Text; name : Text; role : AppRole };

  // Stable storage (implicitly stable in persistent actor)
  var usersEntries : [(Text, User)] = [];
  var sessionsEntries : [(Text, Session)] = [];
  var requisitionsEntries : [(Nat, ReqTupleLegacy)] = [];
  var requisitionsEntriesV2 : [(Nat, ReqTuple)] = [];
  var nextReqId : Nat = 1;
  var sessionCounter : Nat = 0;

  func natHash(n : Nat) : Nat32 { Nat32.fromNat(n % 2_147_483_647) };

  // HashMaps are transient -- cannot be stable, rebuilt on upgrade via postupgrade
  transient var users : HashMap.HashMap<Text, User> = HashMap.fromIter(Iter.fromArray(usersEntries), 10, Text.equal, Text.hash);
  transient var sessions : HashMap.HashMap<Text, Session> = HashMap.fromIter(Iter.fromArray(sessionsEntries), 10, Text.equal, Text.hash);
  transient var requisitions : HashMap.HashMap<Nat, ReqTuple> = HashMap.fromIter(Iter.fromArray(requisitionsEntriesV2), 10, Nat.equal, natHash);

  let adminEmail = "murtazatinwala@msbinstitute.com";

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
    { id; itemName = t.0; description = t.1; teacherEmail = t.2; quantity = t.3; priority = t.4; dateNeeded = t.5; teacherName = t.6; createdAt = t.7; status = t.8; history = t.9; category = t.10; location = t.11 };
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

  public func createRequisition(sessionId : Text, itemName : Text, description : Text, quantity : Nat, priority : Priority, dateNeeded : Text, category : Text, location : Text) : async Result.Result<Nat, Text> {
    switch (getSession(sessionId)) {
      case null { #err("Not authenticated.") };
      case (?s) {
        if (s.role != #teacher and s.role != #authority) return #err("Only teachers and authority can submit requisitions.");
        let id = nextReqId;
        nextReqId += 1;
        let now = Time.now();
        let entry : HistoryEntry = { actorEmail = s.email; actorName = s.name; timestamp = now; status = #pending; remarks = null };
        requisitions.put(id, (itemName, description, s.email, quantity, priority, dateNeeded, s.name, now, #pending, [entry], category, location));
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
        #ok(Iter.toArray(Iter.map(requisitions.entries(), func((id, t) : (Nat, ReqTuple)) : RequisitionView { reqToView(id, t) })));
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
            requisitions.put(id, (t.0, t.1, t.2, t.3, t.4, t.5, t.6, t.7, #approved, Array.append(t.9, [entry]), t.10, t.11));
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
            requisitions.put(id, (t.0, t.1, t.2, t.3, t.4, t.5, t.6, t.7, #rejected, Array.append(t.9, [entry]), t.10, t.11));
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
            let entry : HistoryEntry = { actorEmail = s.email; actorName = s.name; timestamp = Time.now(); status = #completed; remarks = null };
            requisitions.put(id, (t.0, t.1, t.2, t.3, t.4, t.5, t.6, t.7, #completed, Array.append(t.9, [entry]), t.10, t.11));
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
            let entry : HistoryEntry = { actorEmail = s.email; actorName = s.name; timestamp = Time.now(); status = #notFulfilled; remarks = ?remarks };
            requisitions.put(id, (t.0, t.1, t.2, t.3, t.4, t.5, t.6, t.7, #notFulfilled, Array.append(t.9, [entry]), t.10, t.11));
            #ok(());
          };
        };
      };
    };
  };

  system func preupgrade() {
    usersEntries := Iter.toArray(users.entries());
    sessionsEntries := Iter.toArray(sessions.entries());
    requisitionsEntriesV2 := Iter.toArray(requisitions.entries());
    requisitionsEntries := [];
  };

  system func postupgrade() {
    users := HashMap.fromIter(Iter.fromArray(usersEntries), 10, Text.equal, Text.hash);
    sessions := HashMap.fromIter(Iter.fromArray(sessionsEntries), 10, Text.equal, Text.hash);
    let legacyMigrated = Array.map<(Nat, ReqTupleLegacy), (Nat, ReqTuple)>(requisitionsEntries, func((id, t) : (Nat, ReqTupleLegacy)) : (Nat, ReqTuple) { (id, (t.0, t.1, t.2, t.3, t.4, t.5, t.6, t.7, t.8, t.9, "", "")) });
    let combined = Array.append(legacyMigrated, requisitionsEntriesV2);
    requisitions := HashMap.fromIter(Iter.fromArray(combined), 10, Nat.equal, natHash);
    usersEntries := [];
    sessionsEntries := [];
    requisitionsEntries := [];
    requisitionsEntriesV2 := [];
    seedAdmin();
  };
};
