App = {
  loading: false,
  contracts: {},

  id : "",

  load: async() => {
      await App.loadWeb3();
      await App.loadAccount();
      await App.loadContract();
      await App.render()
  },

  loadWeb3: async () => {
     
      if (window.ethereum) {
        App.web3Provider = window.ethereum;
        try {
          // Request account access
          await window.ethereum.enable();
        } catch (error) {
          // User denied account access...
          console.error("User denied account access")
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        App.web3Provider = window.web3.currentProvider;
      }
      // If no injected web3 instance is detected, fall back to Ganache
      
      web3 = new Web3(App.web3Provider);
    }, 
  loadAccount: async () => {
      // App.account = web3.eth.accounts[0]
      App.account = web3.eth.accounts[0]
      console.log(web3.eth.accounts)
      App.from_data = {from: App.account}

  },

  loadContract: async () => {
    var EnergyToken = await $.getJSON('EnergyToken.json');
    

    App.contracts.EnergyToken = TruffleContract(EnergyToken);

    App.contracts.EnergyToken.setProvider(App.web3Provider)

    App.EnergyToken = await App.contracts.EnergyToken.deployed()

    console.log(App.EnergyToken)

    App.EnergyToken.name(App.from_data).then(result => {
      console.log(result)
    })

    App.noOfLots = await App.getNoOfLots()
    // console.log(await App.getPlantLog(2))
    // console.log(await App.getDistributorLog(2))
    // console.log(await App.getConsumerLog(2))
    
  },
  getNoOfLots: async () => {
    var lot =  await App.EnergyToken.currentLot(App.from_data)
    App.noOfLots = lot.toString()
    return lot.toString()
  },
  getPlantLog: async lot => {
    // if (!App.EnergyToken){
    //    await App.loadContract()
    // }
    var data = await App.EnergyToken.plantLogs(lot, App.from_data)
    var units = data[0].toString()
    var time = data[2].toString()
    time = App.unixTimestampToDate(time)
    return { units, time, lot }
  },
  getDistributorLog: async lot => {
    var data = await App.EnergyToken.distributorLogs(lot, App.from_data)
    var units = data[0].toString()
    var time = data[2].toString()
    time = App.unixTimestampToDate(time)
    return { units, time, lot }
  },
  getConsumerLog: async lot => {
    var data = await App.EnergyToken.consumerLogs(lot, App.from_data)
    var units = data[0].toString()
    var time = data[2].toString()
    time = App.unixTimestampToDate(time)
    return { units, time, lot}
  },

  render: async => {
    var lotsCardHtml = "";
  //  App.lots.forEach(lot => {
  //     lotsCardHtml += `
  //       <div class="card" style="width: 18rem;">
  //           <div class="card-body">
  //           <h5 class="card-title">${lot.id}</h5>
  //           <h6 class="card-subtitle mb-2 text-muted">12 hr 15 min 56 sec ago</h6>
  //           <p class="card-text">200 units</p>
  //           <a href="#/lot/${lot.id}" class="card-link" style="color: blue;">Check Lot</a>
  //           </div>
  //       </div>
  //     `
  //  })
   $('.flex-container').html(lotsCardHtml)
  },
  lotDetail:async (id) => {
    $(".flex-container").hide();
    $(".search-container").hide();
    $(".lot-detail-container").show()
    $(".plant").html("");
    $(".distributor").html("");
    $(".consumer").html("");
    while (true) {
      if (App.EnergyToken != undefined) {
        break
      }
      await App.sleep(500);
    }
    var plantData = await App.getPlantLog(id)
    var distributorData = await App.getDistributorLog(id)
    var consumerData = await App.getConsumerLog(id)
    console.log(plantData)
    var plantHtml = `
            <h2 class="each-flex-head">Plant</h2>
            <div class="each-flex-p units-flex">
             <p style="font-size: 20px;font-weight: 900;color: rgb(214, 214, 214);">${plantData.units}</p> 
             <p style="color: rgb(214, 214, 214);">units</p>
            </div>
          <!--  <p class="each-flex-p">
              <h4>Lot: ${plantData.lot}</h4>
            </p> -->
            <div class="each-flex-p time-flex">
              <h5>${plantData.time[0]} hrs ${plantData.time[1]} min ${plantData.time[2]} sec ago</h5>
            </div>
    `
     var distributorHtml = `
            <h2 class="each-flex-head">Distributor</h2>
            <div class="each-flex-p units-flex">
             <p style="font-size: 20px;font-weight: 900;color: rgb(214, 214, 214);">${distributorData.units}</p> 
             <p style="color: rgb(214, 214, 214);">units</p>
            </div>
           <!-- <p class="each-flex-p">
              <h4>Lot: ${distributorData.lot}</h4>
            </p> -->
            <div class="each-flex-p time-flex">
              <h5>${distributorData.time[0]} hrs ${distributorData.time[1]} min ${distributorData.time[2]} sec ago</h5>
            </div>
     `
      var consumerHtml = `
            <h2 class="each-flex-head">Consumer</h2>
            <div class="each-flex-p units-flex">
             <p style="font-size: 20px;font-weight: 900;color: rgb(214, 214, 214);">${consumerData.units}</p> 
             <p style="color: rgb(214, 214, 214);">units</p>
            </div>
           <!-- <p class="each-flex-p">
              <h4>Lot: ${consumerData.lot}</h4>
            </p> -->
            <div class="each-flex-p time-flex">
              <h5>${consumerData.time[0]} hrs ${consumerData.time[1]} min ${consumerData.time[2]} sec ago</h5>
            </div>
            `
    $(".plant").html(plantHtml)
    $(".distributor").html(distributorHtml)
    $(".consumer").html(consumerHtml)
  },

  Homepage: async() => {
    $('.flex-container').show();
    $('.lot-detail-container').hide();
    $(".search-container").hide();
    var homeHtml = ''
    var allPlantLogs = []
    while (true) {
      if (App.noOfLots != undefined) {
        break
      }
      await App.sleep(500);
    }
    var i = App.noOfLots;
    console.log(App.noOfLots)
    while (i >= 1) {
      var aPlantLog = await App.getPlantLog(i);
      aPlantLog.id = i
      allPlantLogs.push(aPlantLog)
      homeHtml += `
          <div class="card" style="width: 18rem;">
            <div class="card-body">
            <h5 class="card-title"><b style="font-size: 20px;">${aPlantLog.id}</b></h5>
            <h6 class="card-subtitle mb-2 text-muted">${aPlantLog.time[0]} hrs ${aPlantLog.time[1]} min ${aPlantLog.time[2]} sec ago</h6>
            <p class="card-text"><b style="font-size: 16px;">${aPlantLog.units}</b> units</p>
            <div class="card-link-div">
              <a href="#/lot/${aPlantLog.id}" class="card-link text-right" style="color: blue;">Check Lot</a>
            </div>
            </div>
        </div>
      `
      i--;
    }
   $('.flex-container').html(homeHtml)
    console.log(App.lots)
    App.lots = allPlantLogs
  },
  searchLoaded: () => {
    $('.flex-container').hide();
    $('.lot-detail-container').hide();
    $(".search-container").show();
  },

  hashChanged: (event) => {
    var Url = event.newURL.split("/")
    var i = Url.indexOf('#');
    if (i<1) {
      App.Homepage();
    }
    var len = Url.length
    var toUrl = Url[i+1]
    console.log(toUrl)
   if(toUrl == "search"){
     App.searchLoaded();
   }
   else if (toUrl == "lot") {
     var lot_id = Url[len-1]
     App.lotDetail(lot_id);
   }
   else if (toUrl == "") {
     App.Homepage();
   }
  },
  unixTimestampToDate: (timestamp) => {
    var dateNow = Math.floor(new Date().getTime()/1000);
    var totalSeconds = dateNow - timestamp;
    // console.log(dateNow, timestamp) 
    var date = new Date(totalSeconds * 1000).toISOString().substr(11, 8)
    // var hours = Math.floor(totalSeconds/3600)
    // var minutes = Math.floor(totalSeconds/60)
    // var seconds = Math.floor(totalSeconds%60)
    // console.log(hours, minutes, seconds)
    // console.log(date)
    return date.split(":")
  },


  lots: [ 
    // {
    //   id: 1,
    // },
    // {
    //   id: 2,
    // } 
  ],
  sleep: function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

}

$(() => {
  $(window).load(() => {
    App.load()
    App.hashChanged({newURL: window.location.href})
    window.onhashchange = App.hashChanged
    var dateNow = new Date();
    App.sleep(1000)
    console.log(dateNow.getTime())
  })
})