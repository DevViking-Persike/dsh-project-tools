/**
 * Service Definition for the Docker capability seam (`ctx.docker`): a provider
 * registry and provider-selecting execution for container inspection, image
 * listing, log reads, and Compose lifecycle. Duplicate ids are rejected. At
 * execution time a configured provider must exist and be usable; without one,
 * exactly one usable provider is required, so selection never depends on
 * registration order. The local CLI implementation lives in
 * `@persike/dsh-project-tools/docker-local`.
 * @module @persike/dsh-project-tools/docker
 */
import { Context, Service } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import type { DockerComposeRequest, DockerComposeResult, DockerContainer, DockerControlRequest, DockerEngineResult, DockerEngineStatus, DockerImage, DockerListRequest, DockerLogsRequest, DockerLogsResult, DockerProvider, DockerRemoveContainerRequest, DockerRemoveImageRequest } from './types.ts';
export { DockerError } from './types.ts';
export type { DockerComposeRequest, DockerComposeResult, DockerContainer, DockerContainerState, DockerControlAction, DockerControlRequest, DockerEngineResult, DockerEngineStatus, DockerImage, DockerListRequest, DockerLogsRequest, DockerLogsResult, DockerProvider, DockerRemoveContainerRequest, DockerRemoveImageRequest, } from './types.ts';
declare module '@deepseek-ai/cordis' {
    interface Context {
        docker: DockerRuntime;
    }
}
/**
 * Config for the Docker seam. `provider` pins which backend wins; it is
 * optional because a single registered usable provider auto-selects.
 * Operational overrides must feed this same field rather than introduce a
 * hidden priority chain.
 */
export interface DockerRuntimeConfig {
    /** Explicit provider id. Omitted = auto-select when exactly one is usable. */
    readonly provider?: string;
}
/**
 * The Docker access service, registered as `ctx.docker` (one instance per
 * context).
 *
 * Selection semantics, resolved at execution time and never order-dependent:
 * - A configured id that is registered and `available()` → that provider.
 * - A configured id not registered → `DOCKER_PROVIDER_CONFIGURED_MISSING`.
 * - A configured id registered but unavailable → `DOCKER_PROVIDER_CONFIGURED_UNAVAILABLE`.
 * - No id configured, exactly one registered usable provider → that provider.
 * - No id configured, several usable providers → `DOCKER_PROVIDER_AMBIGUOUS`.
 * - No id configured, no usable provider → `DOCKER_PROVIDER_UNAVAILABLE`.
 */
export declare class DockerRuntime extends Service {
    /** Provider selection config; `$DSH_DOCKER_PROVIDER` feeds the same field. */
    static Config: z<DockerRuntimeConfig>;
    /** Registered backends by id; registration order carries no meaning. */
    private readonly providers;
    /** Configured provider id, or the `$DSH_DOCKER_PROVIDER` operational override. */
    private readonly providerId;
    constructor(ctx: Context, config?: DockerRuntimeConfig);
    /**
     * Register one container backend.
     * @param provider - the backend to add.
     * @returns a disposer that removes it; runs with the calling fiber.
     */
    registerProvider(provider: DockerProvider): () => void;
    /**
     * Ids of every registered backend, in registration order. Selection never
     * consults this order; it exists for diagnostics and for the UI's provider
     * display.
     * @returns the registered provider ids.
     */
    providerIds(): readonly string[];
    /**
     * Resolve the backend one operation must run on. Availability is probed
     * here, so a daemon that stopped between calls fails selection rather than
     * the operation.
     * @returns the selected backend.
     */
    private select;
    /**
     * The single backend that can manage a local engine, or undefined when none
     * offers that capability. Deliberately independent of `select()`: an engine
     * that is down makes every provider unusable, which is exactly when a caller
     * needs this answer. Several capable backends stay ambiguous, so nothing
     * starts a runtime the deployment did not name.
     * @returns the engine-managing backend, or undefined.
     */
    private engineProvider;
    /**
     * Report whether an engine is reachable and what can be done about it. A
     * composition whose backends cannot manage an engine answers a status with
     * every capability false, never an error: the absence of the capability is
     * itself the answer a UI renders.
     * @param signal - cancellation for the underlying probe.
     * @returns the engine status.
     */
    engineStatus(signal?: AbortSignal): Promise<DockerEngineStatus>;
    /**
     * Start the local container runtime.
     * @param signal - cancellation for the underlying command.
     * @returns the settled status and the command output.
     * @throws {DockerError} `DOCKER_ENGINE_UNMANAGEABLE` when no backend can start one.
     */
    startEngine(signal?: AbortSignal): Promise<DockerEngineResult>;
    /**
     * Install a container runtime on this machine.
     * @param signal - cancellation for the underlying command.
     * @returns the settled status and the command output.
     * @throws {DockerError} `DOCKER_ENGINE_UNMANAGEABLE` when no backend can install one.
     */
    installEngine(signal?: AbortSignal): Promise<DockerEngineResult>;
    /**
     * List containers on the selected backend.
     * @param request - listing filters.
     * @param signal - cancellation for the engine call.
     * @returns the matching containers.
     */
    list(request?: DockerListRequest, signal?: AbortSignal): Promise<readonly DockerContainer[]>;
    /**
     * Apply one lifecycle action to a single container on the selected backend.
     * @param request - the container and the action to apply.
     * @param signal - cancellation for the engine call.
     * @returns the container's state after the action settled.
     */
    control(request: DockerControlRequest, signal?: AbortSignal): Promise<DockerContainer>;
    /**
     * Remove one container from the selected backend. A backend without the
     * capability raises rather than reporting a removal that never happened.
     * @param request - the container to remove and whether to force it.
     * @param signal - cancellation for the engine call.
     * @returns nothing; the caller re-reads the listing.
     */
    removeContainer(request: DockerRemoveContainerRequest, signal?: AbortSignal): Promise<void>;
    /**
     * Remove one locally stored image from the selected backend.
     * @param request - the image to remove and whether to force it.
     * @param signal - cancellation for the engine call.
     * @returns nothing; the caller re-reads the listing.
     */
    removeImage(request: DockerRemoveImageRequest, signal?: AbortSignal): Promise<void>;
    /**
     * List locally available images on the selected backend.
     * @param signal - cancellation for the engine call.
     * @returns the local images.
     */
    images(signal?: AbortSignal): Promise<readonly DockerImage[]>;
    /**
     * Read one container's logs from the selected backend.
     * @param request - container and range to read.
     * @param signal - cancellation for the engine call.
     * @returns the collected log text.
     */
    logs(request: DockerLogsRequest, signal?: AbortSignal): Promise<DockerLogsResult>;
    /**
     * Start a Compose project on the selected backend.
     * @param request - compose file, project, and service selection.
     * @param signal - cancellation for the engine call.
     * @returns the settled project state.
     */
    composeUp(request: DockerComposeRequest, signal?: AbortSignal): Promise<DockerComposeResult>;
    /**
     * Stop and remove a Compose project's containers on the selected backend.
     * @param request - compose file, project, and service selection.
     * @param signal - cancellation for the engine call.
     * @returns the settled project state.
     */
    composeDown(request: DockerComposeRequest, signal?: AbortSignal): Promise<DockerComposeResult>;
}
export default DockerRuntime;
