(function($) {
  // Navbar: add scrolled class when not at top
  $(window).on('scroll', function() {
    if ($(this).scrollTop() > 60) {
      $('.navbar').addClass('navbar-scrolled');
    } else {
      $('.navbar').removeClass('navbar-scrolled');
    }
  });

  // Scroll to top button
  $(window).on('scroll', function() {
    if ($(this).scrollTop() > 300) {
      $('.hestia-scroll-to-top').addClass('visible');
    } else {
      $('.hestia-scroll-to-top').removeClass('visible');
    }
  });
  $('.hestia-scroll-to-top').on('click', function() {
    $('html, body').animate({ scrollTop: 0 }, 500);
  });

  // Parallax header
  $(window).on('scroll', function() {
    var scrolled = $(this).scrollTop();
    $('.header-filter').css('transform', 'translateY(' + (scrolled * 0.3) + 'px)');
  });
})(jQuery);
