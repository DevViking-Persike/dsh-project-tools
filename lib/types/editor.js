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
import { fail, editorAbsent, editorError, editorRoot, editorTarget, sessionCwd } from "./helpers.js";
/** editor Remote owner. */
let EditorController = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _languageServers_decorators;
    let _listDir_decorators;
    let _readFile_decorators;
    return class EditorController extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _languageServers_decorators = [Remote];
            _listDir_decorators = [Remote];
            _readFile_decorators = [Remote];
            __esDecorate(this, null, _languageServers_decorators, { kind: "method", name: "languageServers", static: false, private: false, access: { has: obj => "languageServers" in obj, get: obj => obj.languageServers }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _listDir_decorators, { kind: "method", name: "listDir", static: false, private: false, access: { has: obj => "listDir" in obj, get: obj => obj.listDir }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _readFile_decorators, { kind: "method", name: "readFile", static: false, private: false, access: { has: obj => "readFile" in obj, get: obj => obj.readFile }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        config = __runInitializers(this, _instanceExtraInitializers);
        static inject = ['typert', 'sessionController', 'workspaceRegistry', 'sessions'];
        static Config = z.object({ editorMaxFileBytes: z.number().step(1).min(1).default(5242880) });
        /** @param ctx - Host services. @param config - validated deployment limits. */
        constructor(ctx, config) {
            super(ctx, 'editorController', { namespace: 'editor' });
            this.config = config;
        }
        /** Execute editor.languageServers.
       * @param request - operator parameters.
       * @param signal - caller cancellation.
       * @returns the settled editor result.
       */
        async languageServers(request, signal) {
            const ctx = this.ctx;
            void ctx;
            void request;
            void signal;
            const lsp = ctx.get('lsp');
            if (lsp === undefined)
                return Promise.resolve({ servers: [] });
            return Promise.resolve({
                servers: lsp.describeProviders().map(provider => ({
                    id: String(provider.id),
                    extensions: [...provider.extensions],
                })),
            });
        }
        /** Execute editor.listDir.
       * @param request - operator parameters.
       * @param signal - caller cancellation.
       * @returns the settled editor result.
       */
        async listDir(request, signal) {
            const ctx = this.ctx;
            void ctx;
            void request;
            void signal;
            const fs = ctx.get('fs');
            if (fs === undefined)
                return fail(editorAbsent());
            const { sessionId, path } = request;
            try {
                const root = await editorRoot(ctx, fs, await sessionCwd(ctx, sessionId), signal);
                const target = path === undefined || path === ''
                    ? root
                    : await editorTarget(fs, root, path, signal);
                const children = await fs.listDir(target, signal);
                // Directories first, then files: a tree reads top-down, and mixing
                // the two by name alone buries folders among their siblings.
                const entries = children
                    .filter(child => child.type === 'file' || child.type === 'directory')
                    .map(child => ({
                    name: child.name,
                    path: child.target.displayPath,
                    directory: child.type === 'directory',
                }))
                    .sort((a, b) => a.directory === b.directory
                    ? a.name.localeCompare(b.name)
                    : (a.directory ? -1 : 1));
                return { path: target.displayPath, root: root.displayPath, entries };
            }
            catch (error) {
                return fail(editorError(error));
            }
        }
        /** Execute editor.readFile.
       * @param request - operator parameters.
       * @param signal - caller cancellation.
       * @returns the settled editor result.
       */
        async readFile(request, signal) {
            const ctx = this.ctx;
            void ctx;
            void request;
            void signal;
            const fs = ctx.get('fs');
            if (fs === undefined)
                return fail(editorAbsent());
            const { sessionId, path } = request;
            try {
                const root = await editorRoot(ctx, fs, await sessionCwd(ctx, sessionId), signal);
                const target = await editorTarget(fs, root, path, signal);
                const info = await fs.stat(target, signal);
                if (info === undefined) {
                    return fail({ code: 'editor-not-found', message: `"${path}" does not exist`, details: {} });
                }
                if (info.type !== 'file') {
                    return fail({ code: 'editor-not-found', message: `"${path}" is not a file`, details: {} });
                }
                if (info.size !== undefined && info.size > this.config.editorMaxFileBytes) {
                    return fail({
                        code: 'editor-too-large',
                        message: `"${path}" is larger than this editor opens (${String(this.config.editorMaxFileBytes)} bytes)`,
                        details: {},
                    });
                }
                const content = await fs.readText(target, signal);
                return { path: target.displayPath, content, version: String(info.version) };
            }
            catch (error) {
                return fail(editorError(error));
            }
        }
    };
})();
export { EditorController };
export default EditorController;
//# sourceMappingURL=editor.js.map