export default {
  props: {
    shape: {
      type: Object,
      required: true,
    },
    styles: {
      type: Object,
      default: () => ({}),
    },
  },
}
