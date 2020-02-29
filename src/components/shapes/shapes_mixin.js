export default {
  props: {
    shape: {
      type: Object,
      required: true,
    },
    zoom: {
      type: Number,
      default: 1,
    },
    styles: {
      type: Object,
      default: () => ({}),
    },
  },
}
