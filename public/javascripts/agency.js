/*!
 * Start Bootstrap - Agency Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function () {
    $('a.page-scroll').bind('click', function (event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });

    $('form[name="contactForm"]').validate({
        rules: {
            name: "required",
            email: "required",
            phone: {
                required: true,
                minlength: 10,
                maxlength: 10
            },
            message: "required"
        },
        messages: {
            name: "Please enter your name.",
            email: "Please enter your email address.",
            phone: {
                required: "Please enter your phone number.",
                minlength: "Length is short, minimum 10 digits required.",
                maxlength: "Length is not valid, maximum 10 digits allowed."
            },
            message: "Please enter a message."
        },
        errorElement: "em",
        errorPlacement: function (error, element) {
            // Add the `help-block` class to the error element
            error.addClass("help-block text-danger");
            if (element.prop("type") === "checkbox") {
                error.insertAfter(element.parent("label"));
            } else if (element.parent().hasClass('input-group')) {
                error.insertAfter(element.parent());
            } else if (element.hasClass("selectpicker")) {
                error.insertAfter(element.parent());
            } else {
                error.insertAfter(element);
            }
        },
        highlight: function (element, errorClass, validClass) {
            $(element).parents(".form-group").addClass("has-error");
        },
        unhighlight: function (element, errorClass, validClass) {
            $(element).parents(".form-group").removeClass("has-error");
        },
        submitHandler: function (form) {
            form.submit();
        }
    });
    $("form #forgotForm").validate({
        rules: {
            username: {
                required: true,
                minlength: 8
            }
        },
        messages: {
            username: {
                required: "Please enter your username.",
                minlength: "Length is short, minimum 8 digits required."
            }
        },
        errorElement: "em",
        errorPlacement: function (error, element) {
            // Add the `help-block` class to the error element
            error.addClass("help-block text-danger");
            if (element.prop("type") === "checkbox") {
                error.insertAfter(element.parent("label"));
            } else if (element.parent().hasClass('input-group')) {
                error.insertAfter(element.parent());
            } else if (element.hasClass("selectpicker")) {
                error.insertAfter(element.parent());
            } else {
                error.insertAfter(element);
            }
        },
        highlight: function (element, errorClass, validClass) {
            $(element).parents(".form-group").addClass("has-error");
        },
        unhighlight: function (element, errorClass, validClass) {
            $(element).parents(".form-group").removeClass("has-error");
        },
        submitHandler: function (form) {
            form.submit();
        }
    });
    $("form #loginForm").validate({
        rules: {
            username: {
                required: true,
                minlength: 8
            },
            password: {
                required: true,
                minlength: 8
            }
        },
        messages: {
            username: {
                required: "Please enter your username.",
                minlength: "Length is short, minimum 8 digits required."
            },
            password: {
                required: "Please enter your password.",
                minlength: "Length is short, minimum 8 digits required."
            },
        },
        errorElement: "em",
        errorPlacement: function (error, element) {
            // Add the `help-block` class to the error element
            error.addClass("help-block text-danger");
            if (element.prop("type") === "checkbox") {
                error.insertAfter(element.parent("label"));
            } else if (element.parent().hasClass('input-group')) {
                error.insertAfter(element.parent());
            } else if (element.hasClass("selectpicker")) {
                error.insertAfter(element.parent());
            } else {
                error.insertAfter(element);
            }
        },
        highlight: function (element, errorClass, validClass) {
            $(element).parents(".form-group").addClass("has-error");
        },
        unhighlight: function (element, errorClass, validClass) {
            $(element).parents(".form-group").removeClass("has-error");
        },
        submitHandler: function (form) {
            form.submit();
        }
    });
});

// Highlight the top nav as scrolling occurs
$('body').scrollspy({
    target: '.navbar-fixed-top'
})

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function () {
    $('.navbar-toggle:visible').click();
});

$("a[data-toggle=\"tab\"]").click(function (e) {
    e.preventDefault();
    $(this).tab("show");
});

$(".container-first button#minus").click(function (event) {
    zoom("out");
});

$(".container-first button#plus").click(function (event) {
    zoom("in");
});

$('.container-first input[name="range"]').on('input change', function (event) {
    $('output[for="range"]').text(formatCurrency($(event.currentTarget).val(), true));
    var loanTerm = $('.container-first input[name="loan-period"]').val();
    var interest = $('.container-first input[name="interest"]').val() / 100;
    var amount = $(event.currentTarget).val();
    $(".container-second span#repayment").text(formatCurrency(getMonthlyPayment(amount, interest, loanTerm), true)).change();
});

$(".container-first input#six").click(function (event) {
    $('.container-first input[name="loan-period"]').val(6).change();
    $(".container-first input#six").parent().addClass('radio-container-checked');
    $(".container-first input#twelve").parent().removeClass('radio-container-checked');
    var loanTerm = $('.container-first input[name="loan-period"]').val();
    var interest = $('.container-first input[name="interest"]').val() / 100;
    var amount = $('.container-first input[name="range"]').val();
    $(".container-second span#repayment").text(formatCurrency(getMonthlyPayment(amount, interest, loanTerm), true)).change();
});

$(".container-first input#twelve").click(function (event) {
    $('.container-first input[name="loan-period"]').val(12).change();
    $(".container-first input#twelve").parent().addClass('radio-container-checked');
    $(".container-first input#six").parent().removeClass('radio-container-checked');
    var loanTerm = $('.container-first input[name="loan-period"]').val();
    var interest = $('.container-first input[name="interest"]').val() / 100;
    var amount = $('.container-first input[name="range"]').val();
    $(".container-second span#repayment").text(formatCurrency(getMonthlyPayment(amount, interest, loanTerm), true)).change();
});

$("section#requirements a#checkValidIds").click(function (event) {
    $("section#requirements div#validIds").toggleClass("hide");
});

$("section#requirements a#checkTIN").click(function (event) {
    $("section#requirements div#validTIN").toggleClass("hide");
});

$("form input").on("keyup change blur", function () {
    $(this).parent().removeClass("has-error");
    $(this).next().text("");
    if ($(this).parent().hasClass("input-group")) {
        $(this).parent().next().text("");
    }
});

$("form select").on("change blur", function () {
    $(this).parent().removeClass("has-error");
    $(this).next().text("");
});

//form-validations
$('input[name="phone"]').on("keyup change blur", function () {
    var phone = this.value;
    if (phone.charAt(0) != '9') {
        this.value = '';
    };
    formatNumber(this.value);
    $("#number").text(this.value);
});

$("#name, #firstName, #lastName").on("keyup change blur", function () {
    $(this).val(formatName($(this).val()));
});

$('input[name="email"]').on("keyup change blur", function () {
    $(this).val(formatEmail($(this).val()));
});

$('input[name="message"]').on("keyup change blur", function () {
    $(this).val(formatMsgs($(this).val()));
});

$('input[name="username"]').on("keyup change blur", function () {
    $(this).val(formatUsername($(this).val()));
});

$("#password, #confirmPassword").on("keyup change blur", function () {
    $(this).val(formatPass($(this).val()));
});

$('input[name="code"]').on("keyup change blur", function () {
    $(this).val(formatNumber($(this).val()));
});

$('input[name="birthdate"]').attr("min", formatDate(dateNowMinusYrs(65)));
$('input[name="birthdate"]').attr("max", formatDate(dateNowMinusYrs(21)));

/*When clicking on Full hide fail/success boxes */
$('form[name="contactForm"] input[name="name"]').focus(function () {
    $('form[name="contactForm"] div#success').html('');
});