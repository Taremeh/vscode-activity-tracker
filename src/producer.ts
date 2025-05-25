import * as vscode from "vscode";
import { EventData, Exporter } from "./types";
import { publishEvent } from "./exporters";

let nextId = 1;
let uri2Id: { [key: string]: number } = {};

function updateAndGetId(uri: string) {
  if (!uri2Id.hasOwnProperty(uri)) {
    uri2Id[uri] = nextId++;
  }
  return uri2Id[uri];
}

// --- Document Event Producers ---

/**
 * Tracks when a text document is opened. Emits an "open" operation for each file-based document,
 * including those already open at extension activation and new ones opened thereafter.
 */
export class DocumentOpenEventProducer {
  static id = "DocumentOpenEvent";
  listen(context: vscode.ExtensionContext, exporter: Exporter) {
    function handler(doc: vscode.TextDocument) {
      if (!vscode.env.isTelemetryEnabled || doc.uri.scheme !== "file") return;
      const id = updateAndGetId(doc.uri.toString());
      const event: EventData = {
        codespaceName: process.env.CODESPACE_NAME || "no_codespace",
        eventName: DocumentOpenEventProducer.id,
        eventTime: Date.now(),
        sessionId: vscode.env.sessionId,
        machineId: vscode.env.machineId,
        documentUri: doc.uri.toString(),
        documentId: id,
        operation: "open",
        rangeOffset: "0",
        rangeLength: "0",
        rangestart_line: "0",
        rangestart_character: "0",
        rangeend_line: "0",
        rangeend_character: "0",
      };
      publishEvent(event, exporter);
    }
    vscode.workspace.textDocuments.forEach((doc: vscode.TextDocument) => handler(doc));
    context.subscriptions.push(
      vscode.workspace.onDidOpenTextDocument((doc: vscode.TextDocument) => handler(doc))
    );
  }
}

/**
 * Tracks text changes within an open document. Emits "add", "delete", or "replace"
 * based on contentChanges, capturing the changed text and range.
 */
export class DocumentChangeEventProducer {
  static id = "DocumentChangeEvent";
  listen(context: vscode.ExtensionContext, exporter: Exporter) {
    context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
        if (!vscode.env.isTelemetryEnabled || e.document.uri.scheme !== "file") return;
        const id = updateAndGetId(e.document.uri.toString());
        const change = e.contentChanges[0];
        if (!change) return;
        const { text, range, rangeOffset, rangeLength } = change;
        const op = range.start.isEqual(range.end)
          ? "add"
          : text === ""
            ? "delete"
            : "replace";
        const event: EventData = {
          codespaceName: process.env.CODESPACE_NAME || "no_codespace",
          eventName: DocumentChangeEventProducer.id,
          eventTime: Date.now(),
          sessionId: vscode.env.sessionId,
          machineId: vscode.env.machineId,
          documentUri: e.document.uri.toString(),
          documentId: id,
          operation: op,
          value: text,
          rangeOffset: rangeOffset.toString(),
          rangeLength: rangeLength.toString(),
          rangestart_line: range.start.line.toString(),
          rangestart_character: range.start.character.toString(),
          rangeend_line: range.end.line.toString(),
          rangeend_character: range.end.character.toString(),
        };
        publishEvent(event, exporter);
      })
    );
  }
}

/**
 * Tracks when a document is closed. Emits a "close" operation for file-based documents.
 */
export class DocumentCloseEventProducer {
  static id = "DocumentCloseEvent";
  listen(context: vscode.ExtensionContext, exporter: Exporter) {
    context.subscriptions.push(
      vscode.workspace.onDidCloseTextDocument((doc: vscode.TextDocument) => {
        if (!vscode.env.isTelemetryEnabled || doc.uri.scheme !== "file") return;
        const id = updateAndGetId(doc.uri.toString());
        const event: EventData = {
          codespaceName: process.env.CODESPACE_NAME || "no_codespace",
          eventName: DocumentCloseEventProducer.id,
          eventTime: Date.now(),
          sessionId: vscode.env.sessionId,
          machineId: vscode.env.machineId,
          documentUri: doc.uri.toString(),
          documentId: id,
          operation: "close",
          rangeOffset: "0",
          rangeLength: "0",
          rangestart_line: "0",
          rangestart_character: "0",
          rangeend_line: "0",
          rangeend_character: "0",
        };
        publishEvent(event, exporter);
      })
    );
  }
}

/**
 * Tracks when a document is saved. Emits a "save" operation for file-based documents.
 */
export class DocumentSaveEventProducer {
  static id = "DocumentSaveEvent";
  listen(context: vscode.ExtensionContext, exporter: Exporter) {
    context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument((doc: vscode.TextDocument) => {
        if (!vscode.env.isTelemetryEnabled || doc.uri.scheme !== "file") return;
        const id = updateAndGetId(doc.uri.toString());
        const event: EventData = {
          codespaceName: process.env.CODESPACE_NAME || "no_codespace",
          eventName: DocumentSaveEventProducer.id,
          eventTime: Date.now(),
          sessionId: vscode.env.sessionId,
          machineId: vscode.env.machineId,
          documentUri: doc.uri.toString(),
          documentId: id,
          operation: "save",
          rangeOffset: "0",
          rangeLength: "0",
          rangestart_line: "0",
          rangestart_character: "0",
          rangeend_line: "0",
          rangeend_character: "0",
        };
        publishEvent(event, exporter);
      })
    );
  }
}

// --- Interaction Event Producers ---

/**
 * Tracks when the active (focused) editor changes tab or group. Emits a "focus" operation
 * whenever the user switches between open editors.
 */
export class ActiveEditorChangeEventProducer {
  static id = "ActiveEditorChangeEvent";
  listen(context: vscode.ExtensionContext, exporter: Exporter) {
    context.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor((editor: vscode.TextEditor | undefined) => {
        if (!vscode.env.isTelemetryEnabled || !editor) return;
        const uri = editor.document.uri;
        if (uri.scheme !== "file") return;
        const id = updateAndGetId(uri.toString());
        const event: EventData = {
          codespaceName: process.env.CODESPACE_NAME || "no_codespace",
          eventName: ActiveEditorChangeEventProducer.id,
          eventTime: Date.now(),
          sessionId: vscode.env.sessionId,
          machineId: vscode.env.machineId,
          documentUri: uri.toString(),
          documentId: id,
          operation: "focus",
          rangeOffset: "0",
          rangeLength: "0",
          rangestart_line: "0",
          rangestart_character: "0",
          rangeend_line: "0",
          rangeend_character: "0",
        };
        publishEvent(event, exporter);
      })
    );
  }
}

/**
 * Tracks which editors are currently visible (in all splits). Emits a "visible" operation for each
 * file-based editor whenever the visible set changes.
 */
export class VisibleEditorsChangeEventProducer {
  static id = "VisibleEditorsChangeEvent";
  listen(context: vscode.ExtensionContext, exporter: Exporter) {
    context.subscriptions.push(
      vscode.window.onDidChangeVisibleTextEditors((editors: readonly vscode.TextEditor[]) => {
        if (!vscode.env.isTelemetryEnabled) return;
        editors.forEach((ed: vscode.TextEditor) => {
          if (ed.document.uri.scheme !== "file") return;
          const id = updateAndGetId(ed.document.uri.toString());
          const event: EventData = {
            codespaceName: process.env.CODESPACE_NAME || "no_codespace",
            eventName: VisibleEditorsChangeEventProducer.id,
            eventTime: Date.now(),
            sessionId: vscode.env.sessionId,
            machineId: vscode.env.machineId,
            documentUri: ed.document.uri.toString(),
            documentId: id,
            operation: "visible",
            rangeOffset: "0",
            rangeLength: "0",
            rangestart_line: "0",
            rangestart_character: "0",
            rangeend_line: "0",
            rangeend_character: "0",
          };
          publishEvent(event, exporter);
        });
      })
    );
  }
}

/**
 * Tracks text selection or cursor movements. Emits a "selectionChange" operation with the
 * new start/end positions whenever the user changes selection.
 */
export class TextEditorSelectionChangeEventProducer {
  static id = "TextEditorSelectionChangeEvent";
  listen(context: vscode.ExtensionContext, exporter: Exporter) {
    context.subscriptions.push(
      vscode.window.onDidChangeTextEditorSelection((e: vscode.TextEditorSelectionChangeEvent) => {
        if (!vscode.env.isTelemetryEnabled || e.textEditor.document.uri.scheme !== "file") return;
        const uri = e.textEditor.document.uri;
        const id = updateAndGetId(uri.toString());
        const event: EventData = {
          codespaceName: process.env.CODESPACE_NAME || "no_codespace",
          eventName: TextEditorSelectionChangeEventProducer.id,
          eventTime: Date.now(),
          sessionId: vscode.env.sessionId,
          machineId: vscode.env.machineId,
          documentUri: uri.toString(),
          documentId: id,
          operation: "selectionChange",
          rangeOffset: "0",
          rangeLength: "0",
          rangestart_line: e.selections[0].start.line.toString(),
          rangestart_character: e.selections[0].start.character.toString(),
          rangeend_line: e.selections[0].end.line.toString(),
          rangeend_character: e.selections[0].end.character.toString(),
        };
        publishEvent(event, exporter);
      })
    );
  }
}

/**
 * Tracks when an editor moves between view columns (e.g., dragged between splits).
 * Emits a "viewColumnChange" operation on such moves.
 */
export class TextEditorViewColumnChangeEventProducer {
  static id = "TextEditorViewColumnChangeEvent";
  listen(context: vscode.ExtensionContext, exporter: Exporter) {
    context.subscriptions.push(
      vscode.window.onDidChangeTextEditorViewColumn((e: vscode.TextEditorViewColumnChangeEvent) => {
        const editor = e.textEditor;
        if (!vscode.env.isTelemetryEnabled || editor.document.uri.scheme !== "file") return;
        const uri = editor.document.uri;
        const id = updateAndGetId(uri.toString());
        const event: EventData = {
          codespaceName: process.env.CODESPACE_NAME || "no_codespace",
          eventName: TextEditorViewColumnChangeEventProducer.id,
          eventTime: Date.now(),
          sessionId: vscode.env.sessionId,
          machineId: vscode.env.machineId,
          documentUri: uri.toString(),
          documentId: id,
          operation: "viewColumnChange",
          rangeOffset: "0",
          rangeLength: "0",
          rangestart_line: "0",
          rangestart_character: "0",
          rangeend_line: "0",
          rangeend_character: "0",
        };
        publishEvent(event, exporter);
      })
    );
  }
}

/**
 * Tracks when the VS Code window gains or loses focus. Emits "windowFocused" or
 * "windowBlurred" accordingly to help distinguish active vs idle time.
 */
export class WindowStateChangeEventProducer {
  static id = "WindowStateChangeEvent";
  listen(context: vscode.ExtensionContext, exporter: Exporter) {
    context.subscriptions.push(
      vscode.window.onDidChangeWindowState((ws: vscode.WindowState) => {
        if (!vscode.env.isTelemetryEnabled) return;
        const event: EventData = {
          codespaceName: process.env.CODESPACE_NAME || "no_codespace",
          eventName: WindowStateChangeEventProducer.id,
          eventTime: Date.now(),
          sessionId: vscode.env.sessionId,
          machineId: vscode.env.machineId,
          documentUri: "",
          documentId: 0,
          operation: ws.focused ? "windowFocused" : "windowBlurred",
          rangeOffset: "0",
          rangeLength: "0",
          rangestart_line: "0",
          rangestart_character: "0",
          rangeend_line: "0",
          rangeend_character: "0",
        };
        publishEvent(event, exporter);
      })
    );
  }
}

/**
 * Tracks additions or removals of workspace folders. Emits "workspaceFoldersChange"
 * with event details to record how the workspace layout evolves.
 */
export class WorkspaceFoldersChangeEventProducer {
  static id = "WorkspaceFoldersChangeEvent";
  listen(context: vscode.ExtensionContext, exporter: Exporter) {
    context.subscriptions.push(
      vscode.workspace.onDidChangeWorkspaceFolders((e: vscode.WorkspaceFoldersChangeEvent) => {
        if (!vscode.env.isTelemetryEnabled) return;
        const event: EventData = {
          codespaceName: process.env.CODESPACE_NAME || "no_codespace",
          eventName: WorkspaceFoldersChangeEventProducer.id,
          eventTime: Date.now(),
          sessionId: vscode.env.sessionId,
          machineId: vscode.env.machineId,
          documentUri: "",
          documentId: 0,
          operation: "workspaceFoldersChange",
          value: JSON.stringify(e),
          rangeOffset: "0",
          rangeLength: "0",
          rangestart_line: "0",
          rangestart_character: "0",
          rangeend_line: "0",
          rangeend_character: "0",
        };
        publishEvent(event, exporter);
      })
    );
  }
}

/**
 * Tracks file system create/change/delete events via a watcher. Emits "fsCreate", "fsChange",
 * or "fsDelete" operations based on the file system activity.
 */
export class FileSystemWatcherEventProducer {
  static id = "FileSystemWatcherEvent";
  listen(context: vscode.ExtensionContext, exporter: Exporter) {
    const watcher = vscode.workspace.createFileSystemWatcher("**/*");
    const handler = (uri: vscode.Uri, op: string) => {
      if (!vscode.env.isTelemetryEnabled || uri.scheme !== "file") return;
      const id = updateAndGetId(uri.toString());
      const event: EventData = {
        codespaceName: process.env.CODESPACE_NAME || "no_codespace",
        eventName: FileSystemWatcherEventProducer.id,
        eventTime: Date.now(),
        sessionId: vscode.env.sessionId,
        machineId: vscode.env.machineId,
        documentUri: uri.toString(),
        documentId: id,
        operation: op,
        rangeOffset: "0",
        rangeLength: "0",
        rangestart_line: "0",
        rangestart_character: "0",
        rangeend_line: "0",
        rangeend_character: "0",
      };
      publishEvent(event, exporter);
    };
    context.subscriptions.push(
      watcher.onDidCreate((uri: vscode.Uri) => handler(uri, "fsCreate")),
      watcher.onDidChange((uri: vscode.Uri) => handler(uri, "fsChange")),
      watcher.onDidDelete((uri: vscode.Uri) => handler(uri, "fsDelete"))
    );
  }
}

/**
 * Tracks file rename operations. Emits a "rename" operation with the new URI as value.
 */
export class RenameFilesEventProducer {
  static id = "RenameFilesEvent";
  listen(context: vscode.ExtensionContext, exporter: Exporter) {
    context.subscriptions.push(
      vscode.workspace.onDidRenameFiles((e: vscode.FileRenameEvent) => {
        if (!vscode.env.isTelemetryEnabled) return;
        e.files.forEach((f: { oldUri: vscode.Uri; newUri: vscode.Uri }) => {
          const id = updateAndGetId(f.oldUri.toString());
          const event: EventData = {
            codespaceName: process.env.CODESPACE_NAME || "no_codespace",
            eventName: RenameFilesEventProducer.id,
            eventTime: Date.now(),
            sessionId: vscode.env.sessionId,
            machineId: vscode.env.machineId,
            documentUri: f.oldUri.toString(),
            documentId: id,
            operation: "rename",
            value: f.newUri.toString(),
            rangeOffset: "0",
            rangeLength: "0",
            rangestart_line: "0",
            rangestart_character: "0",
            rangeend_line: "0",
            rangeend_character: "0",
          };
          publishEvent(event, exporter);
        });
      })
    );
  }
}

/**
 * Tracks file creation operations via VS Code API. Emits a "create" operation for each file.
 */
export class CreateFilesEventProducer {
  static id = "CreateFilesEvent";
  listen(context: vscode.ExtensionContext, exporter: Exporter) {
    context.subscriptions.push(
      vscode.workspace.onDidCreateFiles((e: vscode.FileCreateEvent) => {
        if (!vscode.env.isTelemetryEnabled) return;
        e.files.forEach((uri: vscode.Uri) => {
          const id = updateAndGetId(uri.toString());
          const event: EventData = {
            codespaceName: process.env.CODESPACE_NAME || "no_codespace",
            eventName: CreateFilesEventProducer.id,
            eventTime: Date.now(),
            sessionId: vscode.env.sessionId,
            machineId: vscode.env.machineId,
            documentUri: uri.toString(),
            documentId: id,
            operation: "create",
            rangeOffset: "0",
            rangeLength: "0",
            rangestart_line: "0",
            rangestart_character: "0",
            rangeend_line: "0",
            rangeend_character: "0",
          };
          publishEvent(event, exporter);
        });
      })
    );
  }
}

/**
 * Tracks file deletion operations via VS Code API. Emits a "delete" operation for each file.
 */
export class DeleteFilesEventProducer {
  static id = "DeleteFilesEvent";
  listen(context: vscode.ExtensionContext, exporter: Exporter) {
    context.subscriptions.push(
      vscode.workspace.onDidDeleteFiles((e: vscode.FileDeleteEvent) => {
        if (!vscode.env.isTelemetryEnabled) return;
        e.files.forEach((uri: vscode.Uri) => {
          const id = updateAndGetId(uri.toString());
          const event: EventData = {
            codespaceName: process.env.CODESPACE_NAME || "no_codespace",
            eventName: DeleteFilesEventProducer.id,
            eventTime: Date.now(),
            sessionId: vscode.env.sessionId,
            machineId: vscode.env.machineId,
            documentUri: uri.toString(),
            documentId: id,
            operation: "delete",
            rangeOffset: "0",
            rangeLength: "0",
            rangestart_line: "0",
            rangestart_character: "0",
            rangeend_line: "0",
            rangeend_character: "0",
          };
          publishEvent(event, exporter);
        });
      })
    );
  }
}

/**
 * Tracks only single-click (preview) opens.
 */
export class DocumentPreviewEventProducer {
  static id = 'DocumentPreviewEvent';

  listen(context: vscode.ExtensionContext, exporter: Exporter) {
    // onDidChangeTabs gives you opened/closed tabs with isPreview flags
    context.subscriptions.push(
      vscode.window.tabGroups.onDidChangeTabs((e) => {
        // e.opened is an array of Tab objects that just opened
        for (const tab of e.opened) {
          // only text tabs in preview mode
          if (
            tab.input instanceof vscode.TabInputText &&
            tab.input.uri.scheme === 'file' &&
            tab.isPreview
          ) {
            const uriStr = tab.input.uri.toString();
            const id = updateAndGetId(uriStr);
            const event: EventData = {
              codespaceName: process.env.CODESPACE_NAME || "no_codespace",
              eventName: DocumentPreviewEventProducer.id,
              eventTime: Date.now(),
              sessionId: vscode.env.sessionId,
              machineId: vscode.env.machineId,
              documentUri: uriStr,
              documentId: id,
              operation: 'preview',
              rangeOffset: '0',
              rangeLength: '0',
              rangestart_line: '0',
              rangestart_character: '0',
              rangeend_line: '0',
              rangeend_character: '0',
            };
            publishEvent(event, exporter);
          }
        }
      })
    );
  }
}


/**
 * Tracks execution of commands (built-in and extension). Emits a "command" operation with
 * the command name and serialized arguments.
 
export class CommandExecutionEventProducer {
  static id = "CommandExecutionEvent";
  listen(context: vscode.ExtensionContext, exporter: Exporter) {
    context.subscriptions.push(
      vscode.commands.onDidExecuteCommand((e: { command: string; arguments?: any[] }) => {
        if (!vscode.env.isTelemetryEnabled) return;
        const event: EventData = {
          codespaceName: process.env.CODESPACE_NAME || "no_codespace",
          eventName: CommandExecutionEventProducer.id,
          eventTime: Date.now(),
          sessionId: vscode.env.sessionId,
          machineId: vscode.env.machineId,
          documentUri: "",
          documentId: 0,
          operation: e.command,
          value: JSON.stringify(e.arguments || []),
          rangeOffset: "0",
          rangeLength: "0",
          rangestart_line: "0",
          rangestart_character: "0",
          rangeend_line: "0",
          rangeend_character: "0",
        };
        publishEvent(event, exporter);
      })
    );
  }
} */

export const producerCollection = [
  DocumentPreviewEventProducer,
  DocumentOpenEventProducer,
  DocumentChangeEventProducer,
  DocumentCloseEventProducer,
  DocumentSaveEventProducer,
  ActiveEditorChangeEventProducer,
  VisibleEditorsChangeEventProducer,
  TextEditorSelectionChangeEventProducer,
  TextEditorViewColumnChangeEventProducer,
  WindowStateChangeEventProducer,
  WorkspaceFoldersChangeEventProducer,
  FileSystemWatcherEventProducer,
  RenameFilesEventProducer,
  CreateFilesEventProducer,
  DeleteFilesEventProducer,
  // CommandExecutionEventProducer,
];
