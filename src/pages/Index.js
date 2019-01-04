import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { fetchItems } from 'store'
import { withSsr, host, timeAgo } from 'utils'

import styles from './styles'

@connect(
  ({ items }) => ({ items }),
  dispatch => ({
    fetchItems: ids => dispatch(fetchItems(ids)),
  }),
)
@withSsr(styles, false, ({ props }) => {
  const {
    items,
    match: {
      params: { id },
    },
  } = props
  return items[id] && items[id].title
})
export default class HomeView extends React.PureComponent {
  static propTypes = {
    items: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    fetchItems: PropTypes.func.isRequired,
  }

  state = {
    loading: false,
  }

  bootstrap() {
    const { id } = this.props.match.params
    if (this.props.items[id]) {
      return true
    }

    return this.props.fetchItems([id]).then(() => true)
  }

  get item() {
    return this.props.items[this.props.match.params.id]
  }

  fetchItems() {
    const { item } = this

    if (!item || !item.kids) {
      return
    }

    this.setState({
      loading: true,
    })

    this.fetchComments(item).then(() =>
      this.setState({
        loading: false,
      }),
    )
  }

  fetchComments(item) {
    if (item && item.kids) {
      return this.props
        .fetchItems(item.kids)
        .then(() =>
          Promise.all(
            item.kids.map(id => this.fetchComments(this.props.items[id])),
          ),
        )
    }
  }

  componentDidMount() {
    this.fetchItems()
  }

  render() {
    return <div>fdsafdsafd</div>
  }
}