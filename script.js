//  await fetch(`https://dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${key}`);
// const key = "4717cd5b-0579-465b-9bb9-df453c75c7cc"
// let word = "love";

const Data = (function()
{
  const key = "4717cd5b-0579-465b-9bb9-df453c75c7cc"
  getData = async function(word)
  {
    localStorageRecentHandler(word);
    let response = await fetch(`https://dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${key}`);
    let json = response.json();
    return json;
  }
  localStorageRecentHandler = function(word)
  {
    let arr = [];
    if(localStorage.getItem('recent')!==null)
    {
      arr = JSON.parse(localStorage.getItem('recent'));
      arr.push(word);
      localStorage.setItem('recent',JSON.stringify(arr));
    }
    else
    {
      arr.push(word)
      localStorage.setItem('recent',JSON.stringify(arr));
    }
  }
  ,
  LSBookmarkHandler = function(word)
  {
    let arr = [];
    if(localStorage.getItem('bookmarked')!==null)
    {
      arr = JSON.parse(localStorage.getItem('bookmarked'));
      arr.push(word);
      localStorage.setItem('bookmarked',JSON.stringify(arr));
    }
    else
    {
      arr.push(word)
      localStorage.setItem('bookmarked',JSON.stringify(arr));
    }
  }
  

  return{
    getData : getData,
    getRecentWords : function()
    {
      return JSON.parse(localStorage.getItem('recent'));
    },
    LSBookmarkHandler : LSBookmarkHandler,
    getBookmarkWords : function()
    {
      return JSON.parse(localStorage.getItem('bookmarked'));
    }
  }
})();

const UICtrl = (function()
{
  const UISelectors = 
  {
    dictionary : document.querySelector("#dictionary"),
    search : document.querySelector("#search"),
    input : search.querySelector('input.form-control'),
    suggestionCard : dictionary.querySelector(".card > .breadcrumb"),
    recentOl : dictionary.querySelector('#recent-ol'),
    bookmarkOl : dictionary.querySelector('#bookmark-ol'),
  }
  ,
  receiveResponse = function(res)
  {
    let prevCard = UISelectors.dictionary.querySelectorAll('.card');
    prevCard.forEach((card)=>
    {
      card.remove();
    });
    let card = document.createElement('div'); // Contains all the elements AND HTML
    let firstObj = res[0];
    let x=1;

    if(firstObj.hwi!==undefined)
    {
      let h3S = // store Extenal heading
      `<h3 class="lead text-capitalize" id="s-word">${firstObj.hwi.hw}
            <a class="ml-2  my-auto text-info" href="#"><span class="fas fa-volume-up"></span></a>
            <a data-toggle="tooltip" data-placement="top" title="Bookmark The Word" class="ml-2  my-auto text-dark" href="#"><span class="fas fa-bookmark"></span></a>
      </h3>
      <hr>`
  
      card.className = "card mt-4 p-4";
      card.id = "results";
      card.innerHTML = h3S;
  
      res.forEach(wordObj =>
      {
        let definitions = wordObj.shortdef;
        let forms = wordObj.meta.stems;
        let type = wordObj.fl;
        let wordSearched = wordObj.hwi.hw;
        let divH = document.createElement('div');
        let h4S =  // Stores internal heading
        `<h4 class="lead text-capitalize">${wordSearched} (${type})
        <a class="ml-2  my-auto text-secondary" href="#"><span class="fas fa-volume-up"></span></a>
        </h4>`;
        //<a data-toggle="tooltip" data-placement="top" title="Bookmark The Word" class="ml-2  my-auto text-secondary" href="#"><span class="fas fa-bookmark"></span></a>
        let olH = document.createElement('ol');
        divH.className = `response reponse-${x}`;
  
        definitions.forEach(function(meaning)
        {
          let liH = document.createElement('li');
          liH.textContent = meaning;
          olH.append(liH);
        });
  
        divH.innerHTML = h4S;
        divH.append(olH);
        card.append(divH);
        x++;
      }); // End of forEach loop on each word definition
    } // End of If in else part runs if condition is fales
    else
    {
      card = document.createElement('div');
      let ol = document.createElement('ol');
      card.className = "card mt-4 p-4";
      ol.className = "breadcrumb p-4";
      let title = `
      <div class="card-title lead">
          Did you mean this?
      </div>`;
      card.innerHTML = title;
      `
      `
      // <div class="card mt-4 p-4">
      //   <div class="card-title lead">
      //    Did you mean this?
      //   </div>
      //   <ol class="breadcrumb p-4">
      //     <li class="breadcrumb-item"><a href="#">Home</a></li>
      //     <li class="breadcrumb-item"><a href="#">Library</a></li>
      //     <li class="breadcrumb-item"> <a href="#">Data</a></li>
      // </div>
      res.forEach(function(element)
      {
        let li = document.createElement("li");
        li.classList.add("breadcrumb-item");

        let a = document.createElement('a');
        a.textContent = element;
        a.setAttribute('href',"#");
        a.className = "suggestedWord";

        li.append(a);
        ol.append(li);
      });
      card.append(ol);
    }
    UISelectors.dictionary.append(card);
  } // End of Receive Response
  ,
  displayRecent = function(res)
  {
    if(res!==null)
    {
      UISelectors.recentOl.innerHTML = "";
      res.forEach(function(res)
      {
        UISelectors.recentOl.innerHTML += `
        <li class="breadcrumb-item"><a href="#" data-dismiss="modal" class="suggestedWord text-capitalize">${res}</a></li>`
      })
    }
  }
  ,
  displayBookmark = function(res)
  {
    if(res!==null)
    {
      UISelectors.bookmarkOl.innerHTML = "";
      res.forEach(function(res)
      {
        UISelectors.bookmarkOl.innerHTML += `
        <li class="breadcrumb-item"><a href="#" data-dismiss="modal" class="suggestedWord text-capitalize">${res}</a></li>`
      })
    }
  }

  return{
    receiveResponse : receiveResponse,
    getUISelectors : function()
    {
      return UISelectors;
    },
    displayRecent : displayRecent,
    displayBookmark : displayBookmark,
  }
})();

const App = (function()
{
  let selectors;

  return{
    init : function()
    {
      getSelectors = (function()
      {
        selectors = UICtrl.getUISelectors();
      })()
      ,
      // receiveData = (function()
      // {
      //    Data.getData("hate")
      //    .then(res =>
      //    {
      //     UICtrl.receiveResponse(res);
      //    })
      //    .catch(function(err)
      //    {
      //     console.log(err);
      //    });
      // })()
      // ,
      loadRecent = function()
      {
        UICtrl.displayRecent(Data.getRecentWords());
      },
      loadRecent()
      ,
      loadBookmark = function()
      {
        UICtrl.displayBookmark(Data.getBookmarkWords());
      },
      loadBookmark()
      ,
      selectors.search.addEventListener('submit',function(e)
      {
        e.preventDefault();
        let value = selectors.input.value;
        if(value !== "")
        {
          selectors.input.value ="";
          searchWord(value);
        }
      })
      ,
      searchWord = function(word)
      {
        Data.getData(word)
          .then(res =>
          {
           UICtrl.receiveResponse(res);
          })
          .catch(function(err)
          {
            if(err.message ==="Failed to fetch")
              alert("Sorry! You're internet connection is down...")
            else
              alert("Something Went Wrong");
          });
          loadRecent();
      },
      dictionary.onclick = function(e)
      {
        if(e.target.className.includes("suggestedWord"))
        {
          let word = e.target.textContent;
          searchWord(word);
        }
        if(e.target.className.includes("fas fa-bookmark"))
        {
          let word = e.target.parentElement.parentElement.textContent.trim(); // trim is used to remove spaces.
          Data.LSBookmarkHandler(word);
          loadBookmark();
        }
      }
    } // End of init
  }
})();

App.init();
