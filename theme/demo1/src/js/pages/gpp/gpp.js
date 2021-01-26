'use strict';
// Class definition

var GPP = function () {

    var _init = function () {
        $('#add_gpp').on('click', function () {
            $('#kt_datatable_modal').modal('show');
        });
    };

    return {
        // public functions
        init: function () {
            _init();
        }
    };
}();

jQuery(document).ready(function () {
    GPP.init();
});