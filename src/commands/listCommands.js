import { wrapInList, liftListItem } from "https://esm.sh/prosemirror-schema-list";

export function switchList(listType) {
  return function(state, dispatch) {
    const { schema, selection } = state;
    const { $from, from, to } = selection;

    let tr = state.tr;

    // 🔹 Si es heading → convertir a paragraph EN ESTE MISMO TR
    if ($from.parent.type === schema.nodes.heading) {
      tr = tr.setBlockType(from, to, schema.nodes.paragraph);
    }

    // 🔹 Aplicamos visualmente pero SIN crear nuevo state
    if (dispatch) dispatch(tr);

    // 🔹 Ahora usamos el NUEVO state del editor
    const newState = state.apply(tr); // ⚠️ solo para cálculo, no para dispatch

    const { $from: newFrom } = newState.selection;

    // 🔹 Si ya está en lista
    for (let d = newFrom.depth; d > 0; d--) {
      const node = newFrom.node(d);

      if (node.type === schema.nodes.bullet_list ||
          node.type === schema.nodes.ordered_list) {

        if (node.type === listType) {
          return liftListItem(schema.nodes.list_item)(newState, dispatch);
        }

        if (dispatch) {
          dispatch(newState.tr.setNodeMarkup(newFrom.before(d), listType));
        }
        return true;
      }
    }

    // 🔹 No estaba en lista → envolver
    return wrapInList(listType)(newState, dispatch);
  };
}
