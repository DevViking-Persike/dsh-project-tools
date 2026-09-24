/** Host assembly for the Knowledge files, Docker, and Treadmill Remote namespaces. */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import DockerController from './docker.ts';
import EditorController from './editor.ts';
import TreadmillController from './treadmill.ts';
export { DockerController, EditorController, TreadmillController };
export type * from './types.ts';
declare module '@deepseek-ai/cordis' {
    interface Context {
        dockerController: DockerController;
        editorController: EditorController;
        treadmillController: TreadmillController;
    }
}
/** Host plugin identifier. */
export declare const name = "api-project-controller";
/** Deployment limits forwarded to each operator service. */
export declare const Config: z<Schemastery.ObjectS<{
    docker: z<Partial<import("./docker.ts").Config>, import("./docker.ts").Config>;
    editor: z<Partial<import("./editor.ts").Config>, import("./editor.ts").Config>;
}>, Schemastery.ObjectT<{
    docker: z<Partial<import("./docker.ts").Config>, import("./docker.ts").Config>;
    editor: z<Partial<import("./editor.ts").Config>, import("./editor.ts").Config>;
}>>;
/** Validated operator service limits. */
export type Config = ReturnType<typeof Config>;
/**
 * Mount operator services with the deployment's configured limits.
 * @param ctx - Host plugin scope owning the Remote services.
 * @param config - validated limits for Docker and file operations.
 */
export declare function apply(ctx: Context, config: Config): void;
