'use strict';
// Class definition

var GPP = function () {

    var _init = function () {
        $('#add_gpp').on('click', function () {
            $('#kt_datatable_modal').modal('show');
        });

        // date & time range
        $('#kt_daterangepicker_4').daterangepicker({
            buttonClasses: ' btn',
            applyClass: 'btn-primary',
            cancelClass: 'btn-secondary',

            timePicker: true,
            timePickerIncrement: 30,
            locale: {
                format: 'YYYY-MM-DD HH:mm'
            }
        }, function (start, end, label) {
            $('#kt_daterangepicker_4 .form-control').val(start.format('YYYY-MM-DD HH:mm') + ' ~ ' + end.format('YYYY-MM-DD HH:mm'));
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