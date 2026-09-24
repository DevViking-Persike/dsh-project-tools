/**
 * Model-facing Docker tools over `ctx.docker`: `docker_ps`, `docker_images`,
 * `docker_logs`, `docker_compose_up`, and `docker_compose_down`. This package
 * owns schemas, validation, prompt guidance, limits, and presentation, never
 * concrete backends. Enablement controls tool registration; an enabled tool
 * stays visible when no engine is reachable and fails with a structured error
 * at execution time.
 * @module @persike/dsh-project-tools/tool-docker
 */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
export { applyDockerInspectTools, capLogs, formatContainers, formatImages } from './inspect.ts';
export { applyDockerComposeTools, capOutput, formatComposeOutput, parseComposeArgs } from './compose.ts';
/** Cordis plugin name used by loader diagnostics. */
export declare const name = "tool-docker";
/** Services required by the Docker tool suite. */
export declare const inject: string[];
/** Plugin config: which Docker tools to register, their budgets, and output caps. */
export interface Config {
    /** Register the read-only `docker_ps` / `docker_images` / `docker_logs` tools. Defaults to true. */
    inspect?: boolean;
    /**
     * Register the state-changing `docker_compose_up` / `docker_compose_down`
     * tools. Defaults to false: starting and stopping containers is a deployment
     * decision, and a read-only Docker view is useful without it.
     */
    compose?: boolean;
    /** Cooperative timeout budget (ms) for one read-only call. */
    inspectTimeoutMs?: number;
    /** Cooperative timeout budget (ms) for one Compose lifecycle call. */
    composeTimeoutMs?: number;
    /** Cap on characters one `docker_logs` call emits. */
    maxLogChars?: number;
    /** Cap on characters one Compose call emits. */
    maxComposeOutputChars?: number;
}
export declare const Config: z<Config>;
/** Complete config after schemastery applies every field default. */
type ResolvedConfig = Required<Config>;
/**
 * Register the configured Docker tools.
 * @param ctx - Cordis context carrying the tools, docker, and systemPrompt services.
 * @param config - validated plugin config.
 */
export declare function apply(ctx: Context, config: ResolvedConfig): void;
