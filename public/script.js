window.addEventListener('scroll', function() { //changes header color on scroll
    var headerBar = document.getElementById('headerBar');
    var cartIcon = document.getElementById('cartButton');
    var cartIcon = document.getElementById('profileButton');
    var logOutButton = document.getElementById('logOutButton');
    if (window.scrollY > 0) {
        headerBar.classList.add('scrolled');
        cartButton.classList.add('scrolled');
        profileButton.classList.add('scrolled');
        logOutButton.classList.add('scrolled');
    } else {
        headerBar.classList.remove('scrolled');
        cartButton.classList.remove('scrolled');
        profileButton.classList.remove('scrolled');
        logOutButton.classList.remove('scrolled');
    }
});

document.addEventListener('click', function(event) { //allows for product info pop-up
    if (event.target.id === 'product_viewBtn') {
        const productDiv = event.target.closest('.productCard');
        const productName = productDiv.querySelector('.productName').textContent;
        const productPrice = productDiv.querySelector('.productPrice').textContent;
        const productDesc = productDiv.querySelector('.productDesc').textContent;
        const productStock = productDiv.querySelector('.productStock').textContent;
        const productImg = productDiv.querySelector('.productImgLink').textContent;
        

        
        // Show quick view card
        const viewCard = document.getElementById('quickViewCard');
        viewCard.style.display = 'flex';
        viewCard.style.columnGap = '10px'
        viewCard.innerHTML = `
        <img src="/images/${productImg}">
        <div>
        <h2 id="quickViewProductName">${productName}</h2>
        <p id="quickViewProductDesc" style="font-style: italic">${productDesc}</p>
        <p id="quickViewProductPrice">Price: ${productPrice}</p>
        <p id="quickViewProductStock">Remaining in Stock: ${productStock}</p>
        </div>`;
    }
    else if (event.target.id != 'quickViewCard') { //closes pop-up if user clicks anywhere outside the view card
        const quickDiv = document.getElementById("quickViewCard");
        quickDiv.style.display = 'none';
    }
});


let pattern = "";
let patternAlpha = "";
let sortOrder = '';
let sortBy = '';
let sortType = ''; //used in sortQuery
let i = 0;


toggleButton = document.getElementById('togglePriceSort');

toggleAlpha = document.getElementById('toggleAlphabeticalSort');

toggleButton.addEventListener('click', function() { //changes sortOrder and button text based on current button text
    if (toggleButton.textContent === 'Sort $ Descending') {
        toggleButton.textContent === 'Sort $ Ascending';
        sortOrder = 'desc';
    } else if (toggleButton.textContent === 'Sort $ Ascending') {
        toggleButton.textContent === 'Sort $ Descending'
        sortOrder = 'asc';
    }
    console.log(sortOrder);
    sortType = 'price';
    sortBy = ''; //clears alphabetical sort if price sort was clicked
    updateProducts();
});

toggleAlpha.addEventListener('click', function() { //changes sortBy and button text based on current button text
    if (toggleAlpha.textContent === 'Sort Z-A') {
        toggleButton.textContent === 'Sort A-Z';
        sortBy = 'desc';
    } else if (toggleButton.textContent === 'A-Z') {
        toggleAlpha.textContent === 'Sort Z-A'
        sortBy = 'asc';
    }
    console.log(sortBy);
    sortOrder = ''; //clears price sort if alpha sort was clicked
    sortType = 'alpha';
    updateProducts();
});




async function testfunc(text) { //search box function
    sessionStorage.setItem('searchQuery', text);
    if (!window.location.href.includes('/products/1')) {
        window.location.href = '/products/1'; // Redirect to the first page when a new search term is entered
    }
    updateProducts(); //update products to reflect search box
}

// Function to load search term on page load
function loadSearchTerm() {
    var searchTerm = sessionStorage.getItem('searchQuery'); //clears when page is closed
    if (searchTerm) {
        document.getElementById('searchBox').value = searchTerm;
        updateProducts();
    }
}


// Call loadSearchTerm when the page loads
window.onload = loadSearchTerm;


async function updateProducts() {
    let productsFound = 0;
    try {
        const searchText = document.getElementById("searchBox").value;
        const response = await fetch('/api/products', { //fetches info from getProducts function in controllers
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sortOrder, searchText, sortBy, sortType }),
        });
        
        if (response.ok) {
            const productInfo = await response.json(); //access all info from controller
            const products = productInfo.products; //all products inc. pagination limits
            const allProducts = productInfo.allProducts; //all products, no pagination
            let currPage = productInfo.currPage;
            const totalPages = productInfo.totalPages; //pages required to display all items
            //if elseif statements below code for which previous page/next page buttons are visible and clickable
            if (currPage === 1 && currPage === totalPages) { //if on page 1 of 1
                console.log("@1 of 1")
                let prevPageLink = document.getElementById('prevPage');
                prevPageLink.removeAttribute('href'); // Remove the href attribute
                prevPageLink.style.backgroundColor = 'transparent';
                prevPageLink.style.color = 'transparent';
                prevPageLink.style.pointerEvents = 'none'; // Disable pointer events
                let nextPageLink = document.getElementById('nextPage');
                nextPageLink.removeAttribute('href'); // Remove the href attribute
                nextPageLink.style.pointerEvents = 'none'; // Disable pointer events                
                nextPageLink.style.backgroundColor = 'transparent';
                nextPageLink.style.color = 'transparent';
            } else if (currPage === 1 && currPage != totalPages) { //if on page one of X num of pages
                console.log("@1 of x")
                let prevPageLink = document.getElementById('prevPage');
                prevPageLink.removeAttribute('href'); // Remove the href attribute
                prevPageLink.style.backgroundColor = 'transparent';
                prevPageLink.style.color = 'transparent';
                prevPageLink.style.pointerEvents = 'none'; // Disable pointer events
                let nextPageLink = document.getElementById('nextPage');
                nextPageLink.href = '/products/' + (currPage + 1);
                nextPageLink.style.pointerEvents = 'auto'; // Disable pointer events                
                nextPageLink.style.backgroundColor = '#426a5f';
                nextPageLink.style.color = 'white';
            } else if (currPage != 1 && currPage != totalPages) { //if on a middle page
                console.log("@n of x")
                let prevPageLink = document.getElementById('prevPage');
                prevPageLink.href = '/products/' + (currPage - 1);
                prevPageLink.style.backgroundColor = '#426a5f';
                prevPageLink.style.color = 'white';
                prevPageLink.style.pointerEvents = 'auto'; // Disable pointer events
                let nextPageLink = document.getElementById('nextPage');
                nextPageLink.href = '/products/' + (currPage + 1);
                nextPageLink.style.pointerEvents = 'auto'; // Disable pointer events                
                nextPageLink.style.backgroundColor = '#426a5f';
                nextPageLink.style.color = 'white';
            } else { //if on last page
                console.log("@x of x")
                let prevPageLink = document.getElementById('prevPage');
                prevPageLink.style.backgroundColor = '#426a5f';
                prevPageLink.style.color = 'white';
                prevPageLink.href = '/products/' + (currPage - 1);
                prevPageLink.style.pointerEvents = 'auto'; // Re-enable pointer events
                let nextPageLink = document.getElementById('nextPage');
                nextPageLink.removeAttribute('href'); // Remove the href attribute
                nextPageLink.style.pointerEvents = 'none'; // Disable pointer events                
                nextPageLink.style.backgroundColor = 'transparent';
                nextPageLink.style.color = 'transparent';
            }
            const container = document.getElementById('productsContainer');
            container.innerHTML = '';
            products.forEach(product => { //populate productsContainer with all relevant products
                i++;                
                const productDiv = document.createElement('div');
                productDiv.classList.add("productCard");
                if (product.availableStock === 0) { //add to cart button disabled
                    productDiv.innerHTML = `
                    <div style="display: flex; flex-direction: column">
                        <img class="productImg" src="/images/${product.image}">
                        <span id="product_viewBtn" style="text-align: center; background-color: #a6b9ad; margin-top: -24.6px">view details</span>
                    </div>
                    <div class="namePriceDiv" style="display: flex; justify-content: space-between; align-items: center">
                        <p><span class="productName">${product.name} </span>(<span class="productPrice">$${product.price}</span>)
                        </p>
                        <form action="/addToCart/${product._id}" method="POST">
                            <button disabled type="submit" style="text-decoration: line-through">Add to Cart</button>
                        </form>
                    </div>
                    <p class="productDesc" style="display: none">${product.description}</p>
                    <p class="productStock" id="productStock" style="display: none">${product.availableStock}</p>
                    <p class="productImgLink" style="display: none">${product.image}</p>`;
                }
                else { //button enabled
                    productDiv.innerHTML = `
                    <div style="display: flex; flex-direction: column">
                        <img class="productImg" src="/images/${product.image}">
                        <span id="product_viewBtn" style="text-align: center; background-color: #a6b9ad; margin-top: -24.6px">view details</span>
                    </div>
                    <div class="namePriceDiv" style="display: flex; justify-content: space-between; align-items: center">
                        <p><span class="productName">${product.name} </span>(<span class="productPrice">$${product.price}</span>)
                        </p>
                        <form action="/addToCart/${product._id}" method="POST">
                            <button type="submit">Add to Cart</button>
                        </form>
                    </div>
                    <p class="productDesc" style="display: none">${product.description}</p>
                    <p class="productStock" id="productStock" style="display: none">${product.availableStock}</p>
                    <p class="productImgLink" style="display: none">${product.image}</p>`;
                }
                
                container.appendChild(productDiv);
            });
            if (!sortType) {
                console.log("doesnt exist");
            }
            const { pattern, patternAlpha } = analyzeProducts(allProducts); //run func analyzeProducts using allProducts from controller.js—determines sorting pattern
            if (pattern === "ascending") {
                toggleButton.textContent = 'Sort $ Descending';
            } else {
                toggleButton.textContent = 'Sort $ Ascending';
            }
            if (patternAlpha === "ascending") {
                toggleAlpha.textContent = 'Sort Z-A';
            } else {
                toggleAlpha.textContent = 'Sort A-Z';
            }
        } else {
            console.error('Response not ok with status:', response.status);
        }
    } catch (error) {
    console.error('Fetch error:', error.message);
    }
    
    // Update the number of items viewed dynamically
    updateItemsViewed();
}

function analyzeProducts(allProducts) {
    let pattern = "";
    let patternAlpha = "";

    for (let n = 1; n < allProducts.length; n++) { //determines if price pattern
        if (allProducts[n].price > allProducts[n - 1].price) { //if the price of an item is larger than the price of the item before it
            if (pattern === "" || pattern === "ascending") { //if no pattern established or pattern already ascending
                pattern = "ascending"; //make pattern ascending
            } else { //if pattern established as descending
                pattern = "none"; //no pattern—exit func
                break;
            }
        } else if (allProducts[n].price < allProducts[n - 1].price) { //if the price of an item is smaller than the price of the item before it
            if (pattern === "" || pattern === "descending") { //if no pattern established or pattern already descending
                pattern = "descending"; //make pattern descending
            } else { //if pattern established as ascending
                pattern = "none"; //no pattern—exit func
                break;
            }
        }
    }

    for (let n = 1; n < allProducts.length; n++) { //determines if alpha pattern
        if (allProducts[n].name.localeCompare(allProducts[n - 1].name) > 0) { //if name of item comes later in alphabet than the name of the item before it
            if (patternAlpha === "" || patternAlpha === "ascending") { //if no pattern established or pattern already ascending 
                patternAlpha = "ascending";
            } else {
                patternAlpha = "none"; //no pattern—exit func
                break;
            }
        } else if (allProducts[n].name.localeCompare(allProducts[n - 1].name) < 0) { //if name of item comes earlier in alphabet than the name of the item before it
            if (patternAlpha === "" || patternAlpha === "descending") { //if no pattern established or pattern already descending
                patternAlpha = "descending";
            } else {
                patternAlpha = "none"; //no pattern—exit func
                break;
            }
        }
    }

    if (pattern === "ascending" || pattern === "descending") { //if there is any price pattern, clear the alphabet pattern
        patternAlpha = "none";
    } else if (patternAlpha === "ascending" || patternAlpha === "descending") { //if there is any alpha pattern, clear the price pattern
        pattern = "none";
    }

    console.log(pattern);
    console.log(patternAlpha);
    return { pattern, patternAlpha }; //return pattern and patternAlpha for use in updateProducts func
}



// Update the number of items currently being viewed on page, for use in index.ejs
function updateItemsViewed() {
    const itemsCountElement = document.getElementById('itemsCount');
    const productsDisplayed = document.querySelectorAll('.productCard').length;
    itemsCountElement.textContent = productsDisplayed;
}

// Call the function initially and whenever products are updated
updateProducts();
updateItemsViewed();
