angular.module('censusEdu').controller("MainController", function(){
    var vm = this;

    vm.statename = "";
    vm.stateInput = "";
    vm.loadingData = false;
    vm.processingDisplay = "";

    var sdk = new CitySDK();
    census = sdk.modules.census;
    census.enable("21ca50e1a3e22cf2b18083748c278199395408ec");


    // Populate State Selector
    vm.states = [];
    var stateNames = sdk.stateNames();
    jQuery.each(census.stateCapitals, function (stateabbrev, capitalcoords) {
        vm.states.push({
            stateabbrev: stateabbrev,
            stateName: stateNames[stateabbrev].toTitleCase()
        });
    });


    // Check State Data for Selection
    vm.hasStateData = function(){
        if(vm.stateData.length > 0){
            return false;
        }else{
            return true;
        }
    };



    // Select State Data
    vm.stateData = [];
    vm.selectState = function(){
        vm.loadingData = true;
        vm.stateData = [];

        vm.processingDisplay = "Requesting Data from Census";
        var request = {
            "level": "state",
            "state": vm.stateInput,
            "variables": [
                "education_associates",
                "education_bachelors",
                "education_doctorate",
                "education_ged",
                "education_high_school",
                "education_masters",
                "education_none",
                "education_professional",
                "population"
            ],
            "api": "acs5",
            "year": "2014"
        };

        vm.maxscale = 50;

        census.APIRequest(request, function (response) {
            vm.maxscale = 50;
            vm.processingDisplay = "Data Retrieved. Now Processing...";

            if(typeof response.data[0] !="undefined"){
                var intermediateData = response.data[0];
                jQuery.each(intermediateData,function (index,value) {
                    if (index != "population") {
                        if((value / intermediateData.population) > 0.5){
                            vm.maxscale = 100;
                        }

                    }
                });



                jQuery.each(intermediateData,function (index,value) {
                    if(index != "population"){


                    var newBlock = {};
                    newBlock.level = index.replace("_"," ").toTitleCase();
                    newBlock.perCapita = value / intermediateData.population;
                    newBlock.perCapitaUnformatted =(Math.round (newBlock.perCapita*100*100) / 100);
                    newBlock.perCapitaFormatted = newBlock.perCapitaUnformatted + "%";

                    vm.stateData.push(newBlock);
                    }
                });
            }

            vm.processingDisplay = "";
            vm.loadingData = false;
        });
    };// end selectState()

});

