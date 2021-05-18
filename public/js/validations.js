(function ($) {
    "use strict"; // Start of use strict

    //form-validations
    $('input[name="mobileNum"], input[name="accountNum"], input[name="borrowerAcctNo"], input[name="processorAcctNo"], input[name="senderNum"]').on("keyup change blur", function () {
        var mobile = this.value;
        if (mobile.charAt(0) != '9') {
            this.value = '';
        };
        formatNumber(this.value);
        $(this).text(this.value);
    });

    $('').on("keyup change blur", function () {
        $(this).val(formatNumber($(this).val()));
    });

    $('input[name="firstName"], input[name="lastName"], input[name="middleName"], input[name="name"], input[name="accountName"]').on("keyup change blur", function () {
        $(this).val(formatName($(this).val()));
    });

    $('input[name="email"]').on("keyup change blur", function () {
        $(this).val(formatEmail($(this).val()));
    });

    $('input[name="message"], input[name="response"], input[name="placeOfBirth"]').on("keyup change blur", function () {
        $(this).val(formatMsgs($(this).val()));
    });

    $('input[name="username"]').on("keyup change blur", function () {
        $(this).val(formatUsername($(this).val()));
    });

    $('input[name="password"], input[name="confirmPassword"]').on("keyup change blur", function () {
        $(this).val(formatPass($(this).val()));
    });

    $('input[name="code"], input[name="dependents"], input[name="homePhoneNum"], input[name="zipCode"], input[name="zipCode2"], input[name="officePhone"], input[name="referenceNo"]').on("keyup change blur", function () {
        $(this).val(formatNumber($(this).val()));
    });

    $('input[name="dateOfBirth"]').attr("min", formatDate(dateNowMinusYrs(65)));
    $('input[name="dateOfBirth"]').attr("max", formatDate(dateNowMinusYrs(21)));

})(jQuery); // End of use strict