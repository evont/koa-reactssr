import TYPES from './types'
export const lists = (
  state = {
    top: [],
    new: [],
    show: [],
    ask: [],
    job: [],
  },
  action,
) => {
  switch (action.type) {
    case TYPES.SET_LIST:
      return {
        ...state,
        [action.listType]: action.ids,
      }
    default:
      return state
  }
}