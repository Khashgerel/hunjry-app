document.addEventListener('DOMContentLoaded', () => {
    fetch('https://dummyjson.com/recipes')
      .then(response => response.json())
      .then(data => {
        if (data && data.recipes) {
          recipesData = data.recipes;
  
          const urlParams = new URLSearchParams(window.location.search);
          const filter = urlParams.get('id');
        } else {
          console.error('Data format error: No "recipes" array in JSON');
        }
      })
      .catch(error => console.error('There has been a problem with your fetch operation:', error));
  });
  function updateImage(filter){
    
  }