var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import z from '@deepseek-ai/schemastery';
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { fail, editorAbsent, PROJECT_TABLE, projectSkillPath, treadmillAbsent, treadmillError, editorPolicy, editorRoot, editorTarget, sessionCwd, projectTable } from "./helpers.js";
import { parsePipeline, PIPELINE_FILE, updateStageInTable } from '@persike/dsh-treadmill';
/** treadmill Remote owner. */
let TreadmillController = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _describe_decorators;
    let _readFile_decorators;
    let _writeFile_decorators;
    let _updateStage_decorators;
    let _saveToProject_decorators;
    return class TreadmillController extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _describe_decorators = [Remote];
            _readFile_decorators = [Remote];
            _writeFile_decorators = [Remote];
            _updateStage_decorators = [Remote];
            _saveToProject_decorators = [Remote];
            __esDecorate(this, null, _describe_decorators, { kind: "method", name: "describe", static: false, private: false, access: { has: obj => "describe" in obj, get: obj => obj.describe }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _readFile_decorators, { kind: "method", name: "readFile", static: false, private: false, access: { has: obj => "readFile" in obj, get: obj => obj.readFile }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _writeFile_decorators, { kind: "method", name: "writeFile", static: false, private: false, access: { has: obj => "writeFile" in obj, get: obj => obj.writeFile }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateStage_decorators, { kind: "method", name: "updateStage", static: false, private: false, access: { has: obj => "updateStage" in obj, get: obj => obj.updateStage }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _saveToProject_decorators, { kind: "method", name: "saveToProject", static: false, private: false, access: { has: obj => "saveToProject" in obj, get: obj => obj.saveToProject }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        config = __runInitializers(this, _instanceExtraInitializers);
        static inject = ['typert', 'sessionController', 'workspaceRegistry', 'sessions'];
        static Config = z.object({});
        /** @param ctx - Host services. @param config - validated deployment limits. */
        constructor(ctx, config) {
            super(ctx, 'treadmillController', { namespace: 'treadmill' });
            this.config = config;
        }
        /** Execute treadmill.describe.
       * @param request - operator parameters.
       * @param signal - caller cancellation.
       * @returns the settled treadmill result.
       */
        async describe(request, signal) {
            const ctx = this.ctx;
            void ctx;
            void request;
            void signal;
            const treadmill = ctx.get('treadmill');
            if (treadmill === undefined)
                return fail(treadmillAbsent());
            const description = await treadmill.describe();
            const project = await projectTable(ctx, request.sessionId, signal);
            if (project === undefined)
                return { ...description, tableSource: 'global' };
            try {
                const { pipelineError: _global, ...rest } = description;
                return { ...rest, tableSource: 'project', stages: parsePipeline(project.text) };
            }
            catch (error) {
                return {
                    ...description, tableSource: 'project', stages: [],
                    pipelineError: `${PROJECT_TABLE}: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        }
        /** Execute treadmill.readFile.
       * @param request - operator parameters.
       * @param signal - caller cancellation.
       * @returns the settled treadmill result.
       */
        async readFile(request, signal) {
            const ctx = this.ctx;
            void ctx;
            void request;
            void signal;
            const treadmill = ctx.get('treadmill');
            if (treadmill === undefined)
                return fail(treadmillAbsent());
            try {
                return { path: request.path, content: await treadmill.readFile(request.path) };
            }
            catch (error) {
                return fail(treadmillError(error));
            }
        }
        /** Execute treadmill.writeFile.
       * @param request - operator parameters.
       * @param signal - caller cancellation.
       * @returns the settled treadmill result.
       */
        async writeFile(request, signal) {
            const ctx = this.ctx;
            void ctx;
            void request;
            void signal;
            const treadmill = ctx.get('treadmill');
            if (treadmill === undefined)
                return fail(treadmillAbsent());
            try {
                await treadmill.writeFile(request.path, request.content);
                return { path: request.path };
            }
            catch (error) {
                return fail(treadmillError(error));
            }
        }
        /** Execute treadmill.updateStage.
       * @param request - operator parameters.
       * @param signal - caller cancellation.
       * @returns the settled treadmill result.
       */
        async updateStage(request, signal) {
            const ctx = this.ctx;
            void ctx;
            void request;
            void signal;
            const treadmill = ctx.get('treadmill');
            if (treadmill === undefined)
                return fail(treadmillAbsent());
            const { sessionId, id, enabled, gate } = request;
            const patch = { ...enabled === undefined ? {} : { enabled }, ...gate === undefined ? {} : { gate } };
            try {
                if (sessionId === undefined) {
                    await treadmill.updateStage(id, patch);
                    return { id, tableSource: 'global' };
                }
                // The project's own table starts as a copy of the effective table,
                // so the first switch records every stage, not just the one flipped.
                const fs = ctx.get('fs');
                if (fs === undefined)
                    return fail(editorAbsent());
                const project = await projectTable(ctx, sessionId, signal);
                const text = project?.text ?? await treadmill.readFile(PIPELINE_FILE);
                const target = project?.target
                    ?? await editorTarget(fs, await editorRoot(ctx, fs, await sessionCwd(ctx, sessionId), signal), PROJECT_TABLE, signal);
                await fs.writeText(target, updateStageInTable(text, id, patch), undefined, signal, editorPolicy(ctx, sessionId));
                return { id, tableSource: 'project' };
            }
            catch (error) {
                return fail(treadmillError(error));
            }
        }
        /** Execute treadmill.saveToProject.
       * @param request - operator parameters.
       * @param signal - caller cancellation.
       * @returns the settled treadmill result.
       */
        async saveToProject(request, signal) {
            const ctx = this.ctx;
            void ctx;
            void request;
            void signal;
            const treadmill = ctx.get('treadmill');
            if (treadmill === undefined)
                return fail(treadmillAbsent());
            const fs = ctx.get('fs');
            if (fs === undefined)
                return fail(editorAbsent());
            const { sessionId, path, content } = request;
            const projectPath = projectSkillPath(path);
            if (projectPath === undefined) {
                return fail({ code: 'treadmill-denied', message: `"${path}" is not a skill or command; only those can live in a project`, details: {} });
            }
            try {
                const target = await editorTarget(fs, await editorRoot(ctx, fs, await sessionCwd(ctx, sessionId), signal), projectPath, signal);
                await fs.writeText(target, content, undefined, signal, editorPolicy(ctx, sessionId));
                return { path: projectPath };
            }
            catch (error) {
                return fail(treadmillError(error));
            }
        }
    };
})();
export { TreadmillController };
export default TreadmillController;
//# sourceMappingURL=treadmill.js.map