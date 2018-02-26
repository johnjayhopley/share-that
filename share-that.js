/**
 * ShareThat
 * @version 1.0
 * @author John Hopley <jhopley@readingroom.com>
 */

/**
 * Object#assignRecursive - protopal method for deep mergin objects (recursive)
 * @param {Object} original
 * @parram {Object} target
 * @return Object
 */
Object.assignRecursive = function(original, ...target) {
  if (!target.length) { 
    return original 
  };

  const source = target.shift();
  const isObject = (value) => {
    return (value && typeof value === 'object' && !Array.isArray(value));
  }

  if (isObject(original) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!original[key]) { 
          Object.assign(original, { [key]: {} });
        }
        Object.assignRecursive(original[key], source[key]);
      } else {
        Object.assign(original, { [key]: source[key] });
      }
    }
  }

  return Object.assignRecursive(original, ...target);
}

// base urls an icon urls per sharing network
const cdnFacebookIcon = 'https://cdnjs.cloudflare.com/ajax/libs/simple-icons/3.0.1/facebook.svg';
const cdnPinterestIcon = 'https://cdnjs.cloudflare.com/ajax/libs/simple-icons/3.0.1/pinterest.svg';
const cdnTwitterIcon = 'https://cdnjs.cloudflare.com/ajax/libs/simple-icons/3.0.1/twitter.svg';
const cdnLinkedinIcon = 'https://cdnjs.cloudflare.com/ajax/libs/simple-icons/3.0.1/linkedin.svg';
const cdnCloseIcon = 'https://cdnjs.cloudflare.com/ajax/libs/foundicons/3.0.0/svgs/fi-x.svg';
const facebookBaseUrl = 'https://www.facebook.com/sharer/sharer.php';
const twitterBaseUrl = 'https://twitter.com/share';
const linkedinBaseUrl = 'https://www.linkedin.com/shareArticle';
const pinterestBaseUrl = 'https://pinterest.com/pin/create/button/';

export default class ShareThat {

  /**
   * ShareThat#constructor() - instantiates module and 
   * deep merges custom module settings with default settings
   * @constructor
   * @param {String} selector 
   * @param {Object} settings
   * @returns void 
   */
  constructor(selector = false, settings = {}) {
    this.defaultSettings = {
      inline: false,
      dataLayer: false,
      shareWith: {
        facebook: {
          active: true,
          icon: cdnFacebookIcon,
          baseUrl: facebookBaseUrl,
          props: {
            popup: true,
            height: 350,
            width: 600
          }
        },
        twitter: {
          active: true,
          icon: cdnTwitterIcon,
          baseUrl: twitterBaseUrl,
          props: {
            popup: true,
            height: 350,
            width: 600
          }
        },
        linkedin: {
          active: true,
          icon: cdnLinkedinIcon,
          baseUrl: linkedinBaseUrl,
          props: {
            popup: true,
            height: 350,
            width: 600,
            mini: true,
            title: null,
            summary: null,
            source: null
          }                             
        },
        pinterest: {
          active: true,
          icon: cdnPinterestIcon,
          baseUrl: pinterestBaseUrl,
          props: {
            media: null,
            description: null
          }
        }
      },
      
      closeIcon: cdnCloseIcon
    }

    if(!selector) {
      throw 'ShareThat: Not a valid selector!';
    }

    this.settings = Object.assignRecursive({}, this.defaultSettings, settings);
    this.selector = selector;
    this.initialise();
  }

  /**
   * ShareThat#initialise() - initialises the module functionality - 
   * selects all elements by the selector and generates 
   * the corresponding mark up for each instance.
   * @protected
   * @returns void
   */
  initialise() {
    const elements = [];
    const query = document.querySelectorAll(this.selector);

    if(!query.length) {
      return;
    }
    
    [].forEach.call(query, (element) => {
      elements.push(this.generate(element));
    });

    this.length = elements.length;
    Object.assign(this, elements);
    this.dispatchEvents();
  }

  /**
   * ShareThat#generate() - generates markup
   * @param {Node} element
   * @protected
   * @returns Node
   */
  generate(element) {
    let index = 1;

    let wrapper = ShareThat.createElement('div', {
      className: 'share-that-container'
    });

    let ul = ShareThat.createElement('ul', {
      className: 'share-that__list'
    });

    if(!this.settings.inline) {
      ul.style.display = 'none';
      ul.appendChild(this.createShareItem('close', 0));      
    }

    for(let option in this.settings.shareWith) {
      if(this.settings.shareWith[option].active) {
        ul.appendChild(this.createShareItem(option, index));
        index++;
      }
    }

    element.parentNode.insertBefore(wrapper, element);

    if(this.settings.inline) {
      wrapper.appendChild(ul);
      element.remove();
      return element;
    }

    ShareThat.addClass(element, 'share-that--open');
    wrapper.appendChild(element);
    wrapper.appendChild(ul);

    return element;
  }

  /**
   * ShareThat#generate() - generates indervidual share item node
   * @param {String} option
   * @param {Number} index
   * @protected
   * @returns Node
   */
  createShareItem(option, index) {
    let icon;

    if(option === 'close') {
      icon = this.settings.closeIcon;
    } else {
      icon = this.settings.shareWith[option].icon;
    }

    let li = ShareThat.createElement('li', {
      className: `share-that__list-item share-that__list-item--${option}`,
      id: `st-${index}`,
      innerHTML: `
        <a href="#" title="${option}" class="share-that" data-share-type="${option}">
          <img src="${icon}" alt="${option} share link" alt="share on ${option}">
        </a>
        `
    });

    return li;
  }

  /**
   * ShareThat#toggleOpen() - toggles display on when 
   * settings.inline is set to false
   * @protected
   * @returns void
   */
  toggleOpen(element) {
    let target = element.closest('.share-that-container');
    ShareThat.toggleClass(target, 'active');
    ShareThat.toggleDisplay(target.querySelector('.share-that__list'));  
    ShareThat.toggleDisplay(target.querySelector('.share-that--open'));
  }

  /**
   * ShareThat#dispatchEvents() - dispatches events on generated nodes
   * @protected
   * @returns void
   */
  dispatchEvents() {
    let _instance = this;
    const close = document.querySelectorAll('.share-that__list-item--close');
    const open = document.querySelectorAll('.share-that--open');

    if(!this.settings.inline) {
      ShareThat.on([open, close], 'click', function(event) {
        event.preventDefault();
        _instance.toggleOpen(event.currentTarget);
      });      
    }

    this.share();
  }

  /**
   * ShareThat#share() - dispatches share events for 
   * all active settings.shareWith properties
   * @protected
   * @returns void
   */
  share() {
    const targetClass = '.share-that__list-item';
    const facebook = document.querySelectorAll(targetClass);

    ShareThat.on(facebook, 'click', (event) => {
      event.preventDefault();
      let link = event.currentTarget.querySelector('a');
      let type = link.getAttribute('data-share-type');
      let url = this.generateUrl(type);

      if(type === 'close') {
        return;
      }

      if(this.settings.shareWith.facebook.props.popup) {
         let shareWindow = window.open(
          url, 
          'share-that-popup', 
          `height=${this.settings.shareWith.facebook.props.height},
          width=${this.settings.shareWith.facebook.props.width}`
        );

        if(shareWindow.focus) {
          shareWindow.focus();
        }
      }

      if(this.settings.dataLayer) {
        this.dataLayer(type);
      }

      window.open(url);
      return;
    });
  }

  /**
   * ShareThat#generateUrl() - generates Url using the 
   * provided type and the corresponding props
   * all active settings.shareWith properties
   * @protected
   * @returns void
   */
  generateUrl(type) {
    let url;
    let documentUrl = document.URL;

    switch(type) {
      case 'facebook':
        url = `${this.settings.shareWith.facebook.baseUrl}?u=${documentUrl}`;
      break;
      case 'twitter':
        url = `${this.settings.shareWith.twitter.baseUrl}?url=${documentUrl}`;
      break;
      case 'linkedin':
        url = `${this.settings.shareWith.linkedin.baseUrl}?url=${documentUrl}`;

        if(this.settings.shareWith.linkedin.props.mini) {
          url = `${url}&mini=true`;
        }

        if(this.settings.shareWith.linkedin.props.summary  !== null) {
          url = `${url}&summary=${this.settings.shareWith.linkedin.props.summary}`;
        }

        if(this.settings.shareWith.linkedin.props.title  !== null) {
          url = `${url}&title=${this.settings.shareWith.linkedin.props.title}`;
        }

        if(this.settings.shareWith.linkedin.props.source  !== null) {
          url = `${url}&source=${this.settings.shareWith.linkedin.props.source}`;
        }
      break;
      case 'pinterest':
        url = `${this.settings.shareWith.pinterest.baseUrl}?url=${documentUrl}`;

        if(this.settings.shareWith.pinterest.props.description !== null) {
          url = `${url}&description=${this.settings.shareWith.pinterest.props.description}`
        }

        if(this.settings.shareWith.pinterest.props.media !== null) {
          url = `${url}&description=${this.settings.shareWith.pinterest.props.media}`
        }

      break;
    }

    return url;
  };

  /**
   * ShareThat#dataLayer() - if settings.dataLayer is 
   * set to true then we push our user events into 
   * the window.dataLayer object if it is present.
   * @param {String} elementType
   * @param {Object} settings
   * @protected
   * @returns Node
   */
  dataLayer(type) {
    if(typeof dataLayer === 'object') {
      window.dataLayer.push({
        "event": "socialShare",
        "socialNetwork": type,
        "currentPage": document.URL 
      });      
    }
  }

  /**
   * ShareThat#createElement() - creates DOM node
   * @param {String} elementType
   * @param {Object} settings
   * @static
   * @returns Node
   */
  static createElement(elementType, settings) {
    let element = document.createElement(elementType);
    for(let prop in settings) {
      element[prop] = settings[prop];
    }

    return element;
  }

  /**
   * ShareThat#on() - creates event multiple listeners 
   * @param {Array} elements
   * @param {String} eventType
   * @param {Function} callback
   * @static
   * @returns void
   */
  static on(elements, eventType, callback) {
    if(!Array.isArray(elements)) {
      elements = [elements];
    }

    elements.forEach((elementGroup, index) => {
      elementGroup.forEach((element, index) => {
        element.addEventListener(eventType, function(event) {
          callback(event);
        })
      })
    })
  }

  /**
   * ShareThat#toggleClass() - toggles node class 
   * @param {Node} element
   * @param {String} className
   * @static
   * @returns void
   */
  static toggleClass(element, className) {
    let classes = element.className.split(' ');

    if(classes.indexOf(className,1) != -1) {
      classes = classes.filter((val, index) => {
        return (val !== className);
      });
    } else {
      classes.push(className);
    }

    element.className = classes.join(' ');
  }

  /**
   * ShareThat#toggleDisplay() - toggles style.display 
   * @param {Node} element
   * @static
   * @returns void
   */
  static toggleDisplay(element) {
    if(element.style.display === 'none') {
      return element.style.display = 'block';
    }
    return element.style.display ='none';
  }


  static addClass(element, className) {
    element.classList.add(className);
    return element;
  }

}
