import { EditorState } from "https://esm.sh/prosemirror-state";
import { EditorView } from "https://esm.sh/prosemirror-view";
import { Schema, DOMParser } from "https://esm.sh/prosemirror-model";
import { schema } from "https://esm.sh/prosemirror-schema-basic";
import { addListNodes } from "https://esm.sh/prosemirror-schema-list";
import { exampleSetup } from "https://esm.sh/prosemirror-example-setup";
import { history } from "https://esm.sh/prosemirror-history";
import { keymap } from "https://esm.sh/prosemirror-keymap";
import { baseKeymap } from "https://esm.sh/prosemirror-commands";
import { toggleMark, setBlockType } from "https://esm.sh/prosemirror-commands";
import { wrapInList } from "https://esm.sh/prosemirror-schema-list";


// EditorState → Guarda TODO el estado del editor (documento, selección, plugins)
// EditorView → Es el editor visual que se renderiza en el DOM
// Schema → Define qué tipos de nodos y marcas existen (párrafo, heading, bold, etc.)
// DOMParser → Convierte HTML → documento interno de ProseMirror
// schema-basic → Esquema base (párrafos, headings, bold, italic…)
// addListNodes → Agrega listas (ul, ol, li) al schema
// exampleSetup → Instala plugins de DEMO (menú, teclas, history, atajos, etc.)


// Creamos el "lenguaje" del editor:
// qué nodos existen (párrafo, listas, etc.) y qué formatos (bold, italic)

const paragraph = {
  ...schema.spec.nodes.get("paragraph"),
  attrs: { textAlign: { default: "left" } },
  parseDOM: [{
    tag: "p",
    getAttrs: dom => ({ textAlign: dom.style.textAlign || "left" })
  }],
  toDOM(node) {
    return ["p", { style: `text-align:${node.attrs.textAlign}` }, 0]
  }
};
const nodes = schema.spec.nodes.update("paragraph", paragraph);


const mySchema = new Schema({
  nodes: addListNodes(nodes, "paragraph block*", "block"),
  marks: schema.spec.marks
});

// Aquí conectamos combinaciones de teclas con comandos del editor
// "Mod" significa Ctrl (Windows) o Cmd (Mac)
const myKeymap = keymap({
  "Mod-b": toggleMark(mySchema.marks.strong),
  "Mod-i": toggleMark(mySchema.marks.em),
});


// Los plugins son los "poderes" del editor:
// history → undo/redo
// keymaps → atajos
const plugins = [
  history(),
  myKeymap,
  keymap(baseKeymap)
];

// creacion del estado del editor
const state = EditorState.create({
  doc: DOMParser.fromSchema(mySchema).parse(document.querySelector("#content")),
  plugins
});

// crear el editor
const view = new EditorView(document.querySelector("#editor"), {
  state
});





// toggleMark(mySchema.marks.em)(view.state, view.dispatch);
// toggleMark crea un COMANDO para activar/desactivar un formato (italic aquí)
// (view.state, view.dispatch) ejecuta ese comando sobre el editor actual
// Es como decir: "aplica cursiva a la selección actual"
// toggleMark(...)  → "prepara la acción"
// (...)(state, dispatch) → "ejecútala"



// Cuando presionas B:
// ejecutamos el comando de negrita
// y devolvemos el foco al editor
document.getElementById("boldBtn").onclick = () => {
  toggleMark(mySchema.marks.strong)(view.state, view.dispatch);
  view.focus();
};

document.getElementById("boldBtn").onclick = () => {
  toggleMark(mySchema.marks.strong)(view.state, view.dispatch);
  view.focus();
};
document.getElementById("italicBtn").onclick = () => {
  toggleMark(mySchema.marks.em)(view.state, view.dispatch);
  view.focus();
};
document.getElementById("italicBtn").onclick = () => {
  toggleMark(mySchema.marks.em)(view.state, view.dispatch);
  view.focus();
};

alignLeftBtn.onclick = () => setTextAlign("left")(view.state, view.dispatch);
alignCenterBtn.onclick = () => setTextAlign("center")(view.state, view.dispatch);
alignRightBtn.onclick = () => setTextAlign("right")(view.state, view.dispatch);


function setTextAlign(align) {
  return setBlockType(mySchema.nodes.paragraph, { textAlign: align });
}


// window.view = new EditorView(document.querySelector("#editor"), {
//   state: EditorState.create({
//     doc: DOMParser.fromSchema(mySchema).parse(document.querySelector("#content")),
//     plugins: exampleSetup({schema: mySchema})
//   })
// })