import { EditorState } from "https://esm.sh/prosemirror-state";
import { EditorView } from "https://esm.sh/prosemirror-view";
import { Schema, DOMParser } from "https://esm.sh/prosemirror-model";
import { schema } from "https://esm.sh/prosemirror-schema-basic";
import { addListNodes } from "https://esm.sh/prosemirror-schema-list";
import { exampleSetup } from "https://esm.sh/prosemirror-example-setup";


// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
  marks: schema.spec.marks
})

window.view = new EditorView(document.querySelector("#editor"), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(mySchema).parse(document.querySelector("#content")),
    plugins: exampleSetup({schema: mySchema})
  })
})