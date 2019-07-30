var BBCode =
    {
        ScreenshotComparisonToggleShow: function (link, columnNames, images) {
            var screenshotComparison = new ScreenshotComparison(link);
            screenshotComparison.Open(columnNames, images);
        }
    };

var ScreenshotComparison = (function () {
    var module = function (openerLink) {
        this.OpenerLink = $jq(openerLink);
        this.ComparisonNames = null;
        this.ComparisonLabel = null;
        this.LightBox = null;
        this.SelectedColumn = 0;
        this.SelectedRow = null;
        this.IgnoreMouseEvents = 0;
    };

    module.prototype =
        {
            constructor: module,

            Open: function (columnNames, images) {
                var instance = this;

                // Disable background scrolling. http://stackoverflow.com/a/13891717
                if ($jq(document).height() > $jq(window).height())
                    this.ScrollTop = ($jq("html").scrollTop()) ? $jq("html").scrollTop() : $jq("body").scrollTop(); // Works for Chrome, Firefox, IE...
                else
                    this.ScrollTop = 0;

                this.LightBox = $jq("<div class='screenshot-comparison__container'>");

                this.ComparisonLabel = $jq("<span class='screenshot-comparison__label'></span>");
                this.ComparisonLabel.appendTo(this.LightBox);

                this.MakeComparisonControl(columnNames, images);

                this.LightBox.ShowHC();
                this.LightBox.append($jq("<span class='screenshot-comparison__help'>鼠标左右滑动查看同组画面的不同素材对比，如蓝光源vs压制。在多图对比中，您可以使用键盘上的1-9数字键快速定位到本组画面的第n张图片。</span><p><span class='screenshot-comparison__help'>对比图JS部分由PTP的开发者编写，感谢！</span></p><p><span class='screenshot-comparison__help'>Comparison javascript is written by PTP developers. Credit goes to them.</span></p>"));
                this.LightBox.on("scroll", function () {
                    instance.UpdateLabel();
                });
                // this.LightBox.click(function (event) {
                //     if (!$jq(event.target).hasClass("js-ignore-close-click"))
                //         instance.Close();
                // });

                $jq("#wrapper").HideHC();
                this.LightBox.appendTo($jq("body"));

                this.SelectedRow = $jq(".js-screenshot-comparison__row").first();
                this.UpdateLabel();

                this.BindHotKey("up", function () {
                    instance.ScrollToNextRow(false);
                });
                this.BindHotKey("down", function () {
                    instance.ScrollToNextRow(true);
                });
                this.BindHotKey("left", function () {
                    instance.ShowNextColumn(false);
                });
                this.BindHotKey("right", function () {
                    instance.ShowNextColumn(true);
                });
                this.BindHotKey("escape", function () {
                    instance.Close();
                });

                function BindNumericHotKey(number) {
                    instance.BindHotKey(String(number + 1), function () {
                        instance.ShowColumn(number);
                    });
                }

                for (var i = 0; i < columnNames.length; ++i)
                    BindNumericHotKey(i);
            },

            Close: function () {
                // Unbind doesn't work
                // https://github.com/ccampbell/mousetrap/issues/306

                this.BindHotKey("up", function () {
                });
                this.BindHotKey("down", function () {
                });
                this.BindHotKey("left", function () {
                });
                this.BindHotKey("right", function () {
                });
                this.BindHotKey("escape", function () {
                });

                for (var i = 0; i < this.ComparisonNames.length; ++i)
                    this.BindHotKey(String(i + 1), function () {
                    });

                $jq("#wrapper").ShowHC();
                this.LightBox.remove();

                $jq("html,body").scrollTop(this.ScrollTop);

                this.ComparisonNames = null;
                this.ComparisonLabel = null;
                this.LightBox = null;
                this.SelectedRow = null;
            },

            MakeComparisonControl: function (columnNames, images1d) {
                var instance = this;

                var columnCount = columnNames.length;
                for (var i = 0; i < columnCount; ++i)
                    columnNames[i] = $jq.trim(columnNames[i]);

                this.ComparisonNames = columnNames;

                var images = [];
                var imageCount = images1d.length;
                for (var index = 0; index < imageCount; ++index) {
                    var column = index % columnCount;
                    if (column == 0)
                        images.push([]);

                    images[images.length - 1].push(images1d[index]);
                }

                var dynamicComparisonContainer = $jq("<div>");

                var rowCount = images.length;
                for (var rowIndex = 0; rowIndex < rowCount; ++rowIndex) {
                    var rowDiv = $jq("<div class='screenshot-comparison__row js-screenshot-comparison__row'>");
                    rowDiv.attr("data-current_column", 0);
                    rowDiv.on("mousemove mouseenter mouseleave", function (event) {
                        instance.HandleMouseMove(event);
                    });

                    var imageDiv = $jq("<div>");
                    var image = $jq("<img style='visibility: hidden'>");
                    image.attr("src", images[rowIndex][0]);
                    image.appendTo(imageDiv);
                    imageDiv.appendTo(rowDiv);

                    for (var columnIndex = 0; columnIndex < columnCount; ++columnIndex) {
                        imageDiv = $jq("<div class='screenshot-comparison__image-container'>");

                        if (columnIndex == 0)
                            image = $jq("<img class='screenshot-comparison__image js-screenshot-comparison__image'>");
                        else
                            image = $jq("<img class='screenshot-comparison__image js-screenshot-comparison__image' style='visibility: hidden;'>");

                        image.attr("src", images[rowIndex][columnIndex]);
                        image.appendTo(imageDiv);
                        imageDiv.appendTo(rowDiv);
                    }

                    rowDiv.appendTo(dynamicComparisonContainer);
                }

                dynamicComparisonContainer.appendTo(this.LightBox);

                var oldSchoolComparisonContainer = $jq("<div>");

                for (var rowIndex = 0; rowIndex < rowCount; ++rowIndex) {
                    for (var columnIndex = 0; columnIndex < columnCount; ++columnIndex) {
                        var link = $jq("<a>");
                        link.attr("href", images[rowIndex][columnIndex]);
                        link.attr("target", "_blank");

                        var image = $jq("<img class='screenshot-comparison__old-school-image'>");
                        image.attr("src", images[rowIndex][columnIndex]);
                        image.appendTo(link);

                        link.appendTo(oldSchoolComparisonContainer);
                    }

                    $jq("<br>").appendTo(oldSchoolComparisonContainer);
                }

                var togglerDiv = $jq("<div class='screenshot-comparison__old-school-toggler-container'>");
                togglerDiv.appendTo(this.LightBox);
            },

            UpdateLabel: function () {
                if (this.SelectedRow == null)
                    return;

                var offset = this.ComparisonLabel.offset();
                offset.top = Math.max(this.LightBox.offset().top, this.SelectedRow.offset().top);
                this.ComparisonLabel.offset(offset);
                this.ComparisonLabel.text(this.ComparisonNames[this.SelectedColumn]);
            },

            ShowColumn: function (column) {
                var currentColumn = this.SelectedRow.attr("data-current_column");
                var images = $jq(".js-screenshot-comparison__image", this.SelectedRow);
                images.eq(currentColumn).css('visibility', 'hidden');
                images.eq(column).css('visibility', 'visible');

                this.SelectedRow.attr("data-current_column", column);

                this.SelectedColumn = column;
                this.UpdateLabel();
            },

            HandleMouseMove: function (event) {
                if (this.IgnoreMouseEvents > 0) {
                    --this.IgnoreMouseEvents;
                    return;
                }

                var rowDiv = $jq(event.currentTarget);
                var hoverColumn = 0;
                var parentOffset = rowDiv.offset();
                var x = event.pageX - parentOffset.left - this.LightBox.scrollLeft();
                var visibleWidth = Math.min(rowDiv.width(), this.LightBox.width());

                if (x >= 0 && visibleWidth > 0) {
                    var columnCount = this.ComparisonNames.length;
                    hoverColumn = Math.floor((x * columnCount) / visibleWidth);
                    if (hoverColumn >= columnCount)
                        hoverColumn = 0;

                    this.SelectedRow = rowDiv;
                }

                this.ShowColumn(hoverColumn);
            },

            BindHotKey: function (hotkey, callback) {
                Mousetrap.bindGlobal(hotkey, callback, "keydown");
            },

            ScrollToNextRow: function (scrollToNext) {
                var sibling = scrollToNext ? this.SelectedRow.next('.js-screenshot-comparison__row') : this.SelectedRow.prev('.js-screenshot-comparison__row');
                if (sibling.length > 0) {
                    // If the mouse is over an image then we'll get unwanted mouse
                    // events and selected row could change to a different row, so
                    // we have to ignore the messages.
                    // Firefox: mouseleave, mouseenter. Chrome: mouseleave, mouseenter, mousemove.
                    this.IgnoreMouseEvents = 3;

                    var offset = sibling.position();
                    this.LightBox.scrollTop(this.LightBox.scrollTop() + offset.top);
                    this.SelectedRow = sibling;
                    this.UpdateLabel();
                }
            },

            ShowNextColumn: function (showNext) {
                var column = showNext ? (this.SelectedColumn + 1) : (this.SelectedColumn - 1);
                if (column >= this.ComparisonNames.length)
                    column = 0;
                else if (column < 0)
                    column = this.ComparisonNames.length - 1;

                this.ShowColumn(column);
            }
        };

    return module;
})();