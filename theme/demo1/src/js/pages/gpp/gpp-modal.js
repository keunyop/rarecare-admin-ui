'use strict';
// Class definition

// GPPDatatableModal
var GPPDatatableModal = function () {

    var initDatatable = function () {
        var el = $('#kt_datatable');

        var datatable = el.KTDatatable({
            // datasource definition
            data: {
                type: 'remote',
                source: {
                    read: {
                        url: HOST_URL + '/api/datatables/demos/customers.php',
                    },
                },
                pageSize: 10, // display 20 records per page
                serverPaging: true,
                serverFiltering: false,
                serverSorting: true,
            },

            // layout definition
            layout: {
                theme: 'default',
                scroll: false,
                height: null,
                footer: false,
            },

            // column sorting
            sortable: true,

            pagination: true,

            search: {
                input: el.find('#kt_datatable_search_query'),
                key: 'generalSearch'
            },

            // columns definition
            columns: [{
                field: 'RecordID',
                title: '',
                sortable: false,
                width: 30,
                textAlign: 'center',
            }, {
                field: 'FirstName',
                title: '공동구매ID',
            }, {
                field: 'LastName',
                title: '공동구매명',
            }, {
                field: 'Company',
                title: 'Company',
            }, {
                field: 'Email',
                title: 'Email',
            }, {
                field: 'Phone',
                title: 'Phone',
            }, {
                field: 'Status',
                title: 'Status',
                // callback function support for column rendering
                template: function (row) {
                    var status = {
                        1: {
                            'title': 'Pending',
                            'class': 'label-light-primary'
                        },
                        2: {
                            'title': 'Delivered',
                            'class': ' label-light-success'
                        },
                        3: {
                            'title': 'Canceled',
                            'class': ' label-light-primary'
                        },
                        4: {
                            'title': 'Success',
                            'class': ' label-light-success'
                        },
                        5: {
                            'title': 'Info',
                            'class': ' label-light-info'
                        },
                        6: {
                            'title': 'Danger',
                            'class': ' label-light-danger'
                        },
                        7: {
                            'title': 'Warning',
                            'class': ' label-light-warning'
                        },
                    };
                    return '<span class="label label-lg font-weight-bold' + status[row.Status].class + ' label-inline">' + status[row.Status].title + '</span>';
                },
            }, {
                field: 'Type',
                title: 'Type',
                autoHide: false,
                // callback function support for column rendering
                template: function (row) {
                    var status = {
                        1: {
                            'title': 'Online',
                            'state': 'danger'
                        },
                        2: {
                            'title': 'Retail',
                            'state': 'primary'
                        },
                        3: {
                            'title': 'Direct',
                            'state': 'accent'
                        },
                    };
                    return '<span class="label label-' + status[row.Type].state + ' label-dot mr-2"></span><span class="font-weight-bold text-' + status[row.Type].state +
                        '">' +
                        status[row.Type].title + '</span>';
                },
            }, {
                field: 'Actions',
                width: 130,
                title: 'Actions',
                sortable: false,
                overflow: 'visible',
                textAlign: 'left',
                autoHide: false,
                template: function (row) {
                    return '\
		                  <button data-record-id="' + row.RecordID + '" class="btn btn-sm btn-clean" title="View records">\
		                      <i class="flaticon2-document"></i> Details\
		                  </button>';
                },
            }],
        });

        var card = datatable.closest('.card');

        $('#kt_datatable_search_status').on('change', function () {
            datatable.search($(this).val().toLowerCase(), 'Status');
        });

        $('#kt_datatable_search_type').on('change', function () {
            datatable.search($(this).val().toLowerCase(), 'Type');
        });

        $('#kt_datatable_search_status, #kt_datatable_search_type').selectpicker();

        datatable.on('click', '[data-record-id]', function () {
            $('#kt_datatable_modal').modal('show');
        });
    };

    return {
        // public functions
        init: function () {
            initDatatable();
        }
    };
}();

jQuery(document).ready(function () {
    GPPDatatableModal.init();
});