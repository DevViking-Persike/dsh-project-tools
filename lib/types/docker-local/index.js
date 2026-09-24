/**
 * `@persike/dsh-project-tools/docker-local`: registers the local `docker` CLI backend
 * with `ctx.docker`. A function/namespace plugin (NOT a default-export
 * service): it registers INTO the seam's provider registry.
 * @module @persike/dsh-project-tools/docker-local
 */
import z from '@deepseek-ai/schemastery';
import { LocalDockerProvider } from "./provider.js";
export { LOCAL_DOCKER_PROVIDER_ID, LocalDockerProvider } from "./provider.js";
/** Cordis plugin name used by loader diagnostics. */
export const name = 'docker-local';
/** The Docker seam this provider registers into, plus the process seam it runs on. */
export const inject = ['docker', 'subprocess'];
export const Config = z.object({
    cli: z.string().default('docker'),
    projectRoot: z.string(),
    inspectTimeoutMs: z.number().default(30_000),
    inspectConnectionRetries: z.number().step(1).min(0).default(1),
    // Pulling images and waiting for health checks routinely outlasts an
    // inspection call by an order of magnitude.
    composeTimeoutMs: z.number().default(600_000),
    maxOutputBytes: z.number().default(2_000_000),
    graceMs: z.number().default(5_000),
    defaultLogTail: z.number().default(200),
    allowEngineStart: z.boolean().default(true),
    allowEngineInstall: z.boolean().default(false),
    engineVmCli: z.string().default('colima'),
    engineMacInstaller: z.string().default('brew'),
    // A cold VM boot pulls and starts a Linux guest.
    engineStartTimeoutMs: z.number().default(300_000),
    // A package-manager install downloads the runtime and its dependencies.
    engineInstallTimeoutMs: z.number().default(1_800_000),
});
/** Every positive-integer config field, validated together at load. */
const POSITIVE_FIELDS = [
    'inspectTimeoutMs',
    'composeTimeoutMs',
    'maxOutputBytes',
    'graceMs',
    'defaultLogTail',
    'engineStartTimeoutMs',
    'engineInstallTimeoutMs',
];
/**
 * Register the local Docker CLI provider. Misconfiguration fails at load; an
 * unreachable daemon does not, because availability is a per-call fact the
 * seam probes during selection.
 * @param ctx - Cordis context carrying the docker and subprocess seams.
 * @param config - validated plugin config.
 */
export function apply(ctx, config) {
    for (const field of POSITIVE_FIELDS) {
        const value = config[field];
        if (!Number.isInteger(value) || value < 1) {
            throw new Error(`docker-local: ${field} must be a positive integer`);
        }
    }
    if (config.cli.length === 0) {
        throw new Error('docker-local: cli must not be empty');
    }
    if (config.engineVmCli.length === 0) {
        throw new Error('docker-local: engineVmCli must not be empty');
    }
    if (config.engineMacInstaller.length === 0) {
        throw new Error('docker-local: engineMacInstaller must not be empty');
    }
    const limits = {
        cli: config.cli,
        projectRoot: config.projectRoot ?? process.cwd(),
        inspectTimeoutMs: config.inspectTimeoutMs,
        inspectConnectionRetries: config.inspectConnectionRetries,
        composeTimeoutMs: config.composeTimeoutMs,
        maxOutputBytes: config.maxOutputBytes,
        graceMs: config.graceMs,
        defaultLogTail: config.defaultLogTail,
        platform: process.platform,
        engine: {
            allowStart: config.allowEngineStart,
            allowInstall: config.allowEngineInstall,
            vmCli: config.engineVmCli,
            macInstaller: config.engineMacInstaller,
            startTimeoutMs: config.engineStartTimeoutMs,
            installTimeoutMs: config.engineInstallTimeoutMs,
        },
    };
    ctx.effect(() => ctx.docker.registerProvider(new LocalDockerProvider(ctx, limits)), 'docker-local: provider registration');
}
//# sourceMappingURL=index.js.map