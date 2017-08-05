// Helpers

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

// Element references

var search = document.querySelector('input')
var tpl = document.querySelector('template').content
var resultsContainer = document.getElementById('results')
var menu = document.querySelector('aside')
var aframeEntity = document.querySelector('a-entity[io3d-furniture]').components['io3d-furniture']
var snippet = document.querySelector('code')
var idContainer = document.getElementById('product-id')

// Event handlers

search.addEventListener('input', debounce(function () {
  IO3D.utils.services.call('Product.search', {
    searchQuery: {
      query: `${search.value}*`
    },
    limit: 50
  }).then(function (results) {
    resultsContainer.innerHTML = ''
    results.forEach((product) => {
      var item = document.importNode(tpl, true)
      item.querySelector('img').src = `https://storage.3d.io${product.preview}`
      item.querySelector('.product-name').textContent = product.productDisplayName
      item.querySelector('.product-manufacturer').textContent = product.manufacturer
      item.children[0].dataset.productId = product.productResourceId
      resultsContainer.appendChild(item)
    })
  })
}, 500))

resultsContainer.addEventListener('click', function (evt) {
  var productContainer = Array.from(evt.path).find(function (item) {
    return item.className == 'product'
  })

  if(!productContainer) return
  var productId = productContainer.dataset.productId

  document.querySelector('aside').classList.add('menu-active')
  aframeEntity.data.id = productId
  aframeEntity.update()
  idContainer.textContent =productId
  snippet.textContent = `<a-scene>\n\t<a-entity io3d-furniture="id:${productId}"></a-entity>\n</a-scene>`
  Prism.highlightElement(snippet)
})