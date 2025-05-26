# VS Code Telemetry Activity Tracker

We built upon the VS Code extension originally developed by the [Educational Technology Collective](https://github.com/educational-technology-collective/vscode-telemetry/) as our foundation. This extension generates and exports telemetry data from the editor to support data-driven research and the design of improved coding experiences at scale. We extended the plugin to 
- capture additional events — such as window focus and blur states
- enhanced its robustness by adjusting the scope of data being logged, or by incorporating events that strictly reflect user actions, including tracking which files are currently open or in focus. 
- improved documentation by providing docstrings for all producer classes (i.e., all trackable events)

We use this modified version within our research lab to better understand how developers use the VS Code IDE.

## Configuration

The settings file `settings.json` controls the activated events and data exporters. Either user settings or workspace settings work. 

To add a data exporter, users should assign exporter type along with function arguments when configuring `exporters`.

This extension provides 3 default exporters.

- [`console_exporter`](./src/exporters.ts#L6), which sends telemetry data to the browser console
- [`file_exporter`](./src/exporters.ts#L9), which saves telemetry data to local file
- [`remote_exporter`](./src/exporters.ts#L34), which sends telemetry data to a remote http endpoint

See configuration example [here](./configuration-example/settings.json). By default, the `file_exporter` and `remote_exporter` are active.

### Syntax

`activateEvents`: An array of active events. Each active event in the array should have the following structure:

```python
{
    'name': # string, producer event name
    'logWholeDocument': # boolean, whether to export the entire document content when event is triggered
}
```

The extension would only generate and export data for valid event that has an id associated with the event class, and the event name is included in `activeEvents`. Note that these are not native VS Code event names, but rather manually defined events using native VS Code events to hook onto. You can define your own events (i.e., listeners) in the [./src/producer.ts](./src/producer.ts) file.
The extension will export the entire file (or notebook) content only for valid events when the `logWholeDocument` flag is True.

`exporters`: An array of exporters. Each exporter in the array should have the following structure:

```python
{
    'type': # One of 'console_exporter', 'file_exporter', 'remote_exporter',
    'args': # Optional. Arguments passed to the exporter function.
            # It needs to contain 'path' for file_exporter, 'url' for remote_exporter.
    'activeEvents': # Optional. Exporter's local activeEvents config will override global activeEvents config
}
```

## Links

[Original Base Extension "Telemetry" (Educational Technology Collective)](https://github.com/educational-technology-collective/vscode-telemetry/)
