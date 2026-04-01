/* eslint-disable */

// @ts-nocheck

import { Actor, HttpAgent, type HttpAgentOptions, type ActorConfig, type Agent, type ActorSubclass } from "@icp-sdk/core/agent";
import type { Principal } from "@icp-sdk/core/principal";
import { idlFactory, type _SERVICE, type AppRole, type LoginResult, type UserView, type RequisitionView, type Priority, type Status } from "./declarations/backend.did";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;

export class ExternalBlob {
    _blob?: Uint8Array<ArrayBuffer> | null;
    directURL: string;
    onProgress?: (percentage: number) => void = undefined;
    private constructor(directURL: string, blob: Uint8Array<ArrayBuffer> | null){
        if (blob) {
            this._blob = blob;
        }
        this.directURL = directURL;
    }
    static fromURL(url: string): ExternalBlob {
        return new ExternalBlob(url, null);
    }
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob {
        const url = URL.createObjectURL(new Blob([
            new Uint8Array(blob)
        ], {
            type: 'application/octet-stream'
        }));
        return new ExternalBlob(url, blob);
    }
    public async getBytes(): Promise<Uint8Array<ArrayBuffer>> {
        if (this._blob) {
            return this._blob;
        }
        const response = await fetch(this.directURL);
        const blob = await response.blob();
        this._blob = new Uint8Array(await blob.arrayBuffer());
        return this._blob;
    }
    public getDirectURL(): string {
        return this.directURL;
    }
    public withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob {
        this.onProgress = onProgress;
        return this;
    }
}

export interface backendInterface {
    login(email: string, password: string): Promise<{ ok: LoginResult } | { err: string }>;
    logout(sessionId: string): Promise<void>;
    validateSession(sessionId: string): Promise<[] | [{ email: string; name: string; role: AppRole }]>;
    createUser(sessionId: string, email: string, password: string, name: string, role: AppRole): Promise<{ ok: null } | { err: string }>;
    updateUser(sessionId: string, email: string, newPassword: [] | [string], newName: [] | [string], newRole: [] | [AppRole]): Promise<{ ok: null } | { err: string }>;
    deleteUser(sessionId: string, email: string): Promise<{ ok: null } | { err: string }>;
    listUsers(sessionId: string): Promise<{ ok: UserView[] } | { err: string }>;
    createRequisition(sessionId: string, itemName: string, description: string, quantity: bigint, priority: Priority, dateNeeded: string): Promise<{ ok: bigint } | { err: string }>;
    getMyRequisitions(sessionId: string): Promise<{ ok: RequisitionView[] } | { err: string }>;
    getAllRequisitions(sessionId: string): Promise<{ ok: RequisitionView[] } | { err: string }>;
    approveRequisition(sessionId: string, id: bigint, remarks: [] | [string]): Promise<{ ok: null } | { err: string }>;
    rejectRequisition(sessionId: string, id: bigint, remarks: string): Promise<{ ok: null } | { err: string }>;
    fulfillRequisition(sessionId: string, id: bigint): Promise<{ ok: null } | { err: string }>;
    markNotFulfilled(sessionId: string, id: bigint, remarks: string): Promise<{ ok: null } | { err: string }>;
}

export class Backend implements backendInterface {
    constructor(private actor: ActorSubclass<_SERVICE>, private _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>, private _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>, private processError?: (error: unknown) => never){}

    async login(email: string, password: string) {
        return this.actor.login(email, password);
    }
    async logout(sessionId: string) {
        return this.actor.logout(sessionId);
    }
    async validateSession(sessionId: string) {
        return this.actor.validateSession(sessionId);
    }
    async createUser(sessionId: string, email: string, password: string, name: string, role: AppRole) {
        return this.actor.createUser(sessionId, email, password, name, role);
    }
    async updateUser(sessionId: string, email: string, newPassword: [] | [string], newName: [] | [string], newRole: [] | [AppRole]) {
        return this.actor.updateUser(sessionId, email, newPassword, newName, newRole);
    }
    async deleteUser(sessionId: string, email: string) {
        return this.actor.deleteUser(sessionId, email);
    }
    async listUsers(sessionId: string) {
        return this.actor.listUsers(sessionId);
    }
    async createRequisition(sessionId: string, itemName: string, description: string, quantity: bigint, priority: Priority, dateNeeded: string) {
        return this.actor.createRequisition(sessionId, itemName, description, quantity, priority, dateNeeded);
    }
    async getMyRequisitions(sessionId: string) {
        return this.actor.getMyRequisitions(sessionId);
    }
    async getAllRequisitions(sessionId: string) {
        return this.actor.getAllRequisitions(sessionId);
    }
    async approveRequisition(sessionId: string, id: bigint, remarks: [] | [string]) {
        return this.actor.approveRequisition(sessionId, id, remarks);
    }
    async rejectRequisition(sessionId: string, id: bigint, remarks: string) {
        return this.actor.rejectRequisition(sessionId, id, remarks);
    }
    async fulfillRequisition(sessionId: string, id: bigint) {
        return this.actor.fulfillRequisition(sessionId, id);
    }
    async markNotFulfilled(sessionId: string, id: bigint, remarks: string) {
        return this.actor.markNotFulfilled(sessionId, id, remarks);
    }
}

export interface CreateActorOptions {
    agent?: Agent;
    agentOptions?: HttpAgentOptions;
    actorOptions?: ActorConfig;
    processError?: (error: unknown) => never;
}

export function createActor(canisterId: string, _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>, _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>, options: CreateActorOptions = {}): Backend {
    const agent = options.agent || HttpAgent.createSync({
        ...options.agentOptions
    });
    if (options.agent && options.agentOptions) {
        console.warn("Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent.");
    }
    const actor = Actor.createActor<_SERVICE>(idlFactory, {
        agent,
        canisterId: canisterId,
        ...options.actorOptions
    });
    return new Backend(actor, _uploadFile, _downloadFile, options.processError);
}
