import { bindable, computedFrom } from "aurelia-framework";

export class SiteHeader {

    @bindable
    private pageTitle: string;

    public attached() {
        $(document).ready(() => {
            var $window = $(window);
            var $image = $('.entry-image');

            $window.on('scroll', () => {
                var top = $window.scrollTop();

                if (top < 0 || top > 1500) {
                    return;
                }

                $image
                    .css('transform', 'translate3d(0px, ' + top / 3 + 'px, 0px)')
                    .css('opacity', 1 - Math.max(top / 700, 0));
            });

            $window.trigger('scroll');
        });
    }
}
