/**
 * `DockerProvider` backed by the local `docker` CLI, executed through
 * `ctx.subprocess`. The CLI is the backend rather than the Engine API socket
 * because Compose is a CLI-only capability: reimplementing project
 * orchestration over raw HTTP would duplicate the one component that already
 * owns dependency order, network creation, and teardown.
 * @module @persike/dsh-project-tools/docker-local/provider
 */
import type { Context } from '@deepseek-ai/cordis';
import type { DockerComposeRequest, DockerComposeResult, DockerContainer, DockerControlRequest, DockerEngineResult, DockerEngineStatus, DockerImage, DockerListRequest, DockerLogsRequest, DockerLogsResult, DockerProvider, DockerRemoveContainerRequest, DockerRemoveImageRequest } from '@persike/dsh-project-tools/docker';
/** Registry id of the local CLI backend. */
export declare const LOCAL_DOCKER_PROVIDER_ID = "local";
/**
 * How this backend may manage a local container runtime. macOS ships no
 * daemon, so a Linux VM manager provides one; Linux runs the engine natively
 * and only ever needs the daemon started.
 */
export interface LocalDockerEnginePolicy {
    /** Whether an unreachable engine may be started by this backend. */
    readonly allowStart: boolean;
    /** Whether a missing container runtime may be installed by this backend. */
    readonly allowInstall: boolean;
    /** VM manager used on macOS to provide a Linux engine. */
    readonly vmCli: string;
    /** Package manager that installs the runtime on macOS. */
    readonly macInstaller: string;
    /** Cooperative timeout for one engine start. */
    readonly startTimeoutMs: number;
    /** Cooperative timeout for one engine installation. */
    readonly installTimeoutMs: number;
}
/** Execution limits this backend applies to every CLI invocation. */
export interface LocalDockerLimits {
    /** Executable name or absolute path of the Docker CLI. */
    readonly cli: string;
    /** Engine-management policy; the three engine methods answer from it. */
    readonly engine: LocalDockerEnginePolicy;
    /** Host platform, in `process.platform` vocabulary. */
    readonly platform: NodeJS.Platform;
    /** Working directory for CLI invocations, and the root relative compose paths resolve against. */
    readonly projectRoot: string;
    /** Cooperative timeout for one inspection call (list, images, logs). */
    readonly inspectTimeoutMs: number;
    /** Additional attempts for read-only inspections after a closing gRPC connection. */
    readonly inspectConnectionRetries: number;
    /** Cooperative timeout for one Compose lifecycle call. */
    readonly composeTimeoutMs: number;
    /** Cap on collected stdout bytes of one invocation. */
    readonly maxOutputBytes: number;
    /** Termination grace period handed to the subprocess seam. */
    readonly graceMs: number;
    /** Trailing log lines used when a request states no `tail`. */
    readonly defaultLogTail: number;
}
/**
 * The local Docker CLI backend uses short-lived,
 * non-shell-interpreted `docker` invocations: arguments reach the executable as
 * a fixed argv, so a container name or compose path can never be interpreted
 * as a flag or a shell fragment.
 */
export declare class LocalDockerProvider implements DockerProvider {
    private readonly ctx;
    private readonly limits;
    readonly id = "local";
    constructor(ctx: Context, limits: LocalDockerLimits);
    /**
     * Run one `docker` invocation and collect its output.
     * @param args - arguments after the executable; never shell-interpreted.
     * @param timeoutMs - cooperative timeout for this invocation.
     * @param signal - caller cancellation, combined with the timeout.
     * @returns the settled exit facts and collected output.
     */
    private cli;
    /**
     * Run a CLI invocation that must succeed, classifying a non-zero exit.
     * Read-only inspections retry closing gRPC connections within the configured
     * attempt budget; each attempt retains the timeout and caller cancellation.
     * @param args - arguments after the executable.
     * @param timeoutMs - cooperative timeout for this invocation.
     * @param signal - caller cancellation.
     * @returns the successful invocation's output.
     */
    private run;
    available(): Promise<boolean>;
    /**
     * Run one non-`docker` executable (the VM manager or the installer) and
     * collect its output without classifying a non-zero exit: engine management
     * reports failure through the returned status, not by throwing.
     * @param argv - executable and its arguments; never shell-interpreted.
     * @param timeoutMs - cooperative timeout for this invocation.
     * @param signal - caller cancellation, combined with the timeout.
     * @returns the settled exit facts and collected output, or a launch failure.
     */
    private tool;
    /** Whether an executable resolves on this machine. */
    private installed;
    /**
     * The runtime this platform manages: a Linux VM manager on macOS, the engine
     * itself on Linux. Windows has no runtime this backend installs or starts.
     */
    private engineRuntime;
    engineStatus(signal?: AbortSignal): Promise<DockerEngineStatus>;
    startEngine(signal?: AbortSignal): Promise<DockerEngineResult>;
    installEngine(signal?: AbortSignal): Promise<DockerEngineResult>;
    control(request: DockerControlRequest, signal?: AbortSignal): Promise<DockerContainer>;
    removeContainer(request: DockerRemoveContainerRequest, signal?: AbortSignal): Promise<void>;
    removeImage(request: DockerRemoveImageRequest, signal?: AbortSignal): Promise<void>;
    list(request: DockerListRequest, signal?: AbortSignal): Promise<readonly DockerContainer[]>;
    images(signal?: AbortSignal): Promise<readonly DockerImage[]>;
    logs(request: DockerLogsRequest, signal?: AbortSignal): Promise<DockerLogsResult>;
    /** Build the argv prefix shared by every Compose lifecycle call. */
    private composeArgs;
    /**
     * Resolve the project name the CLI acted on. An explicit name wins;
     * otherwise Compose derives it from the file's directory, which the settled
     * containers report back through their own project label.
     */
    private static projectOf;
    composeUp(request: DockerComposeRequest, signal?: AbortSignal): Promise<DockerComposeResult>;
    composeDown(request: DockerComposeRequest, signal?: AbortSignal): Promise<DockerComposeResult>;
}
