// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';
let listOfBorrowersLabel = [];
let listOfBorrowersData = [];
$.ajaxSetup({
  beforeSend: function (xhr) {
    xhr.setRequestHeader('X-CSRF-Token', $('input[name="_csrf"]').attr('value'));
  }
});
$.ajax({
  url: "/summary/report/borrowers",
  type: "GET",
  data: {},
  cache: false,
  success: function (borrowers) {
    let total = borrowers.reduce((a, b) => parseFloat(a) + parseFloat(b.count), 0);
    borrowers.forEach(d => {
      listOfBorrowersLabel.push(d._id);
      listOfBorrowersData.push(number_format((parseInt(d.count) / total) * 100));
    });
    $('#borrower1').text(' ' + listOfBorrowersLabel[0] + ' - ' + number_format(listOfBorrowersData[0]) + '%');
    $('#borrower2').text(' ' + listOfBorrowersLabel[1] + ' - ' + number_format(listOfBorrowersData[1]) + '%');

    var borrowerCtx = $("#myBorrowerChart");
    var myPieChart = new Chart(borrowerCtx, {
      type: 'doughnut',
      data: {
        labels: listOfBorrowersLabel,
        datasets: [{
          data: listOfBorrowersData,
          backgroundColor: ['#4e73df', '#1cc88a'],
          hoverBackgroundColor: ['#2e59d9', '#17a673'],
          hoverBorderColor: "rgba(234, 236, 244, 1)",
        }],
      },
      options: {
        maintainAspectRatio: false,
        tooltips: {
          backgroundColor: "rgb(255,255,255)",
          bodyFontColor: "#858796",
          borderColor: '#dddfeb',
          borderWidth: 1,
          xPadding: 15,
          yPadding: 15,
          displayColors: false,
          caretPadding: 10,
        },
        legend: {
          display: false
        },
        cutoutPercentage: 80,
      },
    });
  },
  error: function (xhr, status, error) {
    console.log(xhr.responseJSON.message);
  }
});