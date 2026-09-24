/**
 * `@persike/dsh-project-tools/docker-local`: registers the local `docker` CLI backend
 * with `ctx.docker`. A function/namespace plugin (NOT a default-export
 * service): it registers INTO the seam's provider registry.
 * @module @persike/dsh-project-tools/docker-local
 */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
export { LOCAL_DOCKER_PROVIDER_ID, LocalDockerProvider } from './provider.ts';
export type { LocalDockerLimits } from './provider.ts';
/** Cordis plugin name used by loader diagnostics. */
export declare const name = "docker-local";
/** The Docker seam this provider registers into, plus the process seam it runs on. */
export declare const inject: string[];
/** Plugin config: which CLI to run, where, and the limits each invocation carries. */
export interface Config {
    /** Executable name or absolute path of the Docker CLI. */
    cli?: string;
    /** Working directory for invocations, and the root relative compose paths resolve against. Defaults to the harness process cwd. */
    projectRoot?: string;
    /** Cooperative timeout for one inspection call. */
    inspectTimeoutMs?: number;
    /** Additional attempts for read-only inspections after a closing gRPC connection. */
    inspectConnectionRetries?: number;
    /** Cooperative timeout for one Compose lifecycle call. */
    composeTimeoutMs?: number;
    /** Cap on collected output bytes of one invocation. */
    maxOutputBytes?: number;
    /** Termination grace period handed to the subprocess seam. */
    graceMs?: number;
    /** Trailing log lines used when a request states no `tail`. */
    defaultLogTail?: number;
    /**
     * Whether an unreachable engine may be started from the UI. Starting a
     * daemon changes machine state outside the session, so a deployment that
     * does not want that turns it off here.
     */
    allowEngineStart?: boolean;
    /**
     * Whether a missing container runtime may be installed from the UI.
     * Installation writes to the machine outside the workspace, so it is off by
     * default and a deployment opts in.
     */
    allowEngineInstall?: boolean;
    /** VM manager that provides a Linux engine on macOS. */
    engineVmCli?: string;
    /** Package manager used to install the runtime on macOS. */
    engineMacInstaller?: string;
    /** Cooperative timeout for one engine start. */
    engineStartTimeoutMs?: number;
    /** Cooperative timeout for one engine installation. */
    engineInstallTimeoutMs?: number;
}
export declare const Config: z<Config>;
/** Complete config after schemastery applies every field default; `projectRoot` has none. */
type ResolvedConfig = Required<Omit<Config, 'projectRoot'>> & Pick<Config, 'projectRoot'>;
/**
 * Register the local Docker CLI provider. Misconfiguration fails at load; an
 * unreachable daemon does not, because availability is a per-call fact the
 * seam probes during selection.
 * @param ctx - Cordis context carrying the docker and subprocess seams.
 * @param config - validated plugin config.
 */
export declare function apply(ctx: Context, config: ResolvedConfig): void;
