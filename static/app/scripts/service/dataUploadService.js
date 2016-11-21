'use strict';

angular
  .module('andiApp')
  .factory('dataUploadService', dataUploadService);

dataUploadService.$inject = ['$rootScope', 'toastr', 'patientDataservice']

function dataUploadService($rootScope, toastr, patientDataservice) {

  function upload(data, missing){
    var missingValues = [];
    missing.forEach(function(val){
      console.log(val, parseInt(val));
      missingValues.push(parseInt(val));
    });

    var selectedTests = {};
    var patients = [];

    console.log('upload');
    console.log(data);
    var files = data;
    var r = new FileReader();
    r.onloadend = function (e) {
      var data = Papa.parse(e.target.result, {delimiter: '\t', dynamicTyping: true});
      console.log(data);

      // make array with empty patients
      for(var i=0; i<(data.data[0].length-2); i++){
        patients.push({});
      }

      // add data from csv to patients array
      if(data.data.length > 2){
        data.data.splice(1).forEach(function(row){
          // TODO: do data checking
          var fieldName = row[0];
          row.splice(2).forEach(function(value, index){
            var val;
            var p;

            if(patients[index].id === ''){
              p = '#'+(index+1)
            } else {
              p = patients[index].id
            }

            // sex must be 0 or 1
            if(fieldName === 'sex' && (value !== 0 && value !== 1)){
              toastr.warning('Patient '+p+': Invalid value for "sex". Using empty value instead.');
              val = '';
            } else {
              val = value;
            }

            // education must be between 1 and 7
            if(fieldName === 'education' && (value < 0 || value > 7)){
              toastr.warning('Patient '+p+': Invalid value for "education". Using empty value instead.');
              val = '';
            } else {
              val = value;
            }

            // remove missing values
            if(_.includes(missingValues, value)){
              val = '';
            } else {
              val = value;
            }
            patients[index][fieldName] = val;
          });
        });
      }
      $rootScope.$broadcast('csvUploaded', patients);
    };
    r.readAsText(files[0]);
  }

  return {
    upload: upload
  };
}
