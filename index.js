'use strict';

var React       = require('react');
var ReactNative = require('react-native');
var translator  = require('counterpart');
var extend      = require('object-assign');

var PropTypes = React.PropTypes;
var { Text } = ReactNative;

var translatorType = PropTypes.shape({
  getLocale:        PropTypes.func,
  onLocaleChange:   PropTypes.func,
  offLocaleChange:  PropTypes.func,
  translate:        PropTypes.func
});

var Translate = React.createClass({
  displayName: 'Translate',

  contextTypes: {
    translator: translatorType
  },

  propTypes: {
    locale: PropTypes.string,
    count:  PropTypes.number,

    content: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),

    scope: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),

    attributes: PropTypes.object
  },

  statics: {
    textContentComponents: ['Text']
  },

  getDefaultProps() {
    return { component: 'Text' };
  },

  getInitialState() {
    return { locale: this.getTranslator().getLocale() };
  },

  getTranslator() {
    return this.context.translator || translator;
  },

  componentDidMount() {
    if (!this.props.locale) {
      this.getTranslator().onLocaleChange(this.localeChanged);
    }
  },

  componentWillUnmount() {
    if (!this.props.locale) {
      this.getTranslator().offLocaleChange(this.localeChanged);
    }
  },

  localeChanged(newLocale) {
    this.setState({ locale: newLocale });
  },

  render() {
    var translator  = this.getTranslator();
    var textContent = Translate.textContentComponents.indexOf(this.props.component) > -1;
    var interpolate = textContent || this.props.unsafe === true;
    var props       = { locale: this.state.locale, ...this.props, interpolate: interpolate };

    if (props.attributes) {
      for (var attribute in props.attributes) {
        if (props.attributes[attribute]) {
          props[attribute] = translator.translate(props.attributes[attribute], props);
        }
      }

      delete props.attributes;
    }

    if (props.content) {
      var translation = translator.translate(props.content, props);

      delete props.locale;
      delete props.scope;
      delete props.children;
      delete props.interpolate;

      return <Text {...props}>{translation}</Text>
    } else {
      delete props.locale;
      delete props.scope;
      delete props.interpolate;

      return React.createElement(props.component, props);
    }
  }
});

module.exports = Translate;

module.exports.translate = function(key, options) {
  return React.createElement(Translate, extend({}, options, { content: key }));
};

module.exports.translatorType = translatorType;
