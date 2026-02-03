import { wrapInList, liftListItem } from "https://esm.sh/prosemirror-schema-list";


export function switchList(listType) {
  return function(state, dispatch) {
    const { $from } = state.selection;

    // Buscar si estamos dentro de una lista
    for (let d = $from.depth; d > 0; d--) {
      const node = $from.node(d);

      if (node.type === state.schema.nodes.bullet_list ||
          node.type === state.schema.nodes.ordered_list) {

        // 🔁 Si ya es del tipo que queremos → salir de la lista
        if (node.type === listType) {
          return liftListItem(state.schema.nodes.list_item)(state, dispatch);
        }

        // 🔄 Si es otra lista → convertir
        if (dispatch) {
          dispatch(
            state.tr.setNodeMarkup($from.before(d), listType)
          );
        }
        return true;
      }
    }

    // 📌 No hay lista → crear nueva
    return wrapInList(listType)(state, dispatch);
  };
}
