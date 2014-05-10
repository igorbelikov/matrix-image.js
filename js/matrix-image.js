// // // // // // // // //
// * * * * * * * * * * * *
// * Matrix Image
// * * * * * * * * * * * *
// // // // // // // // //
(function (window) {
    'use strict';
    /**
     * Получение матрицы заполненной определенными значениями
     * @param {Number} wc Количество элементов по ширине
     * @param {Number} hc Количество элементов по высоте
     * @param {*} v
     * @returns {Array}
     */
    function getMatrix(wc, hc, v) {
        v = v || 0;
        var matrix = [],
            o = null;

        switch (typeof v) {
            case "number":
                o = Number;
                break;
            default:
                o = Object
        }

        for (var y = 0; y < hc; ++y) {
            matrix[y] = Array.apply(null, new Array(wc)).map(o.prototype.valueOf, v);
        }
        return matrix;
    }

    /**
     * Добавление обработчика события
     * @param {Object} elem
     * @param {String} event
     * @param {Function} fn
     */
    function addEvent(elem, event, fn) {
        function listenHandler(e) {
            var ret = fn.apply(this, arguments);
            if (ret === false) {
                e.stopPropagation();
                e.preventDefault();
            }
            return(ret);
        }

        function attachHandler() {
            var ret = fn.call(elem, window.event);
            if (ret === false) {
                window.event.returnValue = false;
                window.event.cancelBubble = true;
            }
            return(ret);
        }

        if (elem.addEventListener) {
            elem.addEventListener(event, listenHandler, false);
        } else {
            elem.attachEvent("on" + event, attachHandler);
        }
    }

    var
        /**
         * @param {Object} options
         * @constructor
         */
        MImage = function (options) {
            options = options || {};
            this.options = this.prepareOptions(options);
            this.init();
        },
        /**
         * Матрица
         * @param {Array} matrix
         * @constructor
         */
        MMatrix = function (matrix) {
            this.matrix = matrix;
        },
        /**
         * Область, где будет отрисовываться сетка
         * @param {Object} el
         * @constructor
         */
        MCanvas = function (el) {
            this.el = el;
        },
        /**
         * Сетка, в которой будут выводиться элементы матрицы
         * @param {MCanvas} canvas
         * @param {MMatrix} matrix
         * @constructor
         */
        MGrid = function (canvas, matrix) {
            this.canvas = canvas;
            this.matrix = matrix;
        };

    MMatrix.prototype = {
        matrix: null,
        prepare: function () {
            this.each(function (index, x, y, frame) {
                this.matrix[frame][y][x] = {
                    el: null,
                    color: index.color || null,
                    print: Boolean(index),
                    y: y,
                    x: x
                };
            });
        },
        /**
         * Обработка каждого элемента матрицы
         * @param {Function} callback
         * @param {Number} frame
         */
        each: function (callback, frame) {
            frame = frame || 0;
            var matrix = this.matrix[frame];
            for (var y in matrix) {
                if (matrix.hasOwnProperty(y)) {
                    for (var x in matrix[ y ]) {
                        if (matrix[y].hasOwnProperty(x)) {
                            var index = matrix[ y ][ x ];
                            callback.call(this, index, x, y, frame);
                        }
                    }
                }
            }
        }
    };

    MGrid.prototype = {
        matrix: null,
        canvas: null,
        /**
         * Отрисовка сетки
         * @param {Object} el
         */
        render: function (el) {
            var s = 15,
                canvas = this.canvas;

            canvas.style.height = this.getSize(el).h + 'px';
            canvas.style.width = this.getSize(el).w + 'px';

            if (el.style.margin) {
                s = parseInt(el.style.margin);
                el.style.margin = 0;
            }

            this.matrix.prepare();
            this.matrix.each(function (index, x, y) {
                var clone = el.cloneNode();
                clone.style.top = (y * (parseInt(clone.style.height) + (parseInt(clone.style.borderWidth) * 2) + s)) + 'px';
                clone.style.left = (x * (parseInt(clone.style.height) + (parseInt(clone.style.borderWidth) * 2) + s)) + 'px';
                index.el = clone;
                canvas.appendChild(clone);
            });
        },
        /**
         * Получение размеров занимаемые матрицей (px)
         * @param {Object} el
         * @returns {{h: number, w: number}}
         */
        getSize: function (el) {
            return {
                h: ((parseInt(el.style.height) + (parseInt(el.style.borderWidth) * 2) + parseInt(el.style.margin))) * this.matrix.matrix[0].length - parseInt(el.style.margin),
                w: ((parseInt(el.style.height) + (parseInt(el.style.borderWidth) * 2) + parseInt(el.style.margin))) * this.matrix.matrix[0][0].length - parseInt(el.style.margin)
            };
        }
    };

    MCanvas.prototype = {
        el: null,
        prepare: function () {
            if (this.el.isString) {
                this.el = document.getElementById(this.el);
            }
            return this.el;
        },
        clear: function () {
            this.el.innerHTML = null;
        }
    };

    MImage.prototype = {
        grid: null,
        /**
         * Пауза анимации
         */
        pause: function () {
        },
        init: function () {
            var options = this.options,
                canvas = new MCanvas(options.canvas);
            this.grid = new MGrid(canvas.prepare(), new MMatrix(options.matrix));
            var el = options.element();
            // Grid Render
            this.grid.render(el);
            // Add Event Handlers
            this.grid.matrix.each(function (index) {
                if (typeof options.events.onClick === "function") {
                    addEvent(index.el, 'click', function () {
                        return options.events.onClick.call(this, index);
                    });
                }
                if (typeof options.events.onHover === "function") {
                    addEvent(index.el, 'mouseover', function () {
                        return options.events.onHover.call(this, index);
                    });
                }
            });
            this.r();
        },
        /**
         * Подготовка параметров
         * @param {Object} options
         * @returns {Array}
         */
        prepareOptions: function (options) {
            var defaultOptions = this.getDefaultOptions();
            for (var o in defaultOptions) {
                if (defaultOptions.hasOwnProperty(o)) {
                    var option = defaultOptions[o];
                    if (options[o] === undefined)
                        options[o] = option;
                }
            }
            return options;
        },
        getDefaultOptions: function () {
            var matrix =
                [
                    //
                    // # # ##  ### ##  ### # #
                    // ### # #  #  # #  #  # #
                    // # # # #  #  # #  #   #
                    // # # ###  #  ###  #  # #
                    // # # # #  #  # # ### # #
                    //
                    // ##  ### # #
                    // # # # # ###
                    // # # # # # #
                    // # # # # # #
                    // ##  ### # #
                    //
                    // ### # # ### ### ###
                    //  #  ### # # #   #
                    //  #  # # # # ### ###
                    //  #  # # ### # # #
                    // ### # # # # ### ###
                    //
                    [
                        [1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1],
                        [1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1],
                        [1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0],
                        [1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1],
                        [1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
                        getMatrix(23, 1)[0],
                        [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, {color: 'rgb(173, 150, 199)'}, {color: 'rgb(108, 235, 216)'}, {color: 'rgb(91, 143, 154)'}],
                        [0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, {color: 'rgb(247, 107, 168)'}, {color: 'rgb(206, 168, 247)'}, {color: 'rgb(94, 72, 102)'}],
                        [0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, {color: 'rgb(141, 28, 239)'}, {color: 'rgb(225, 64, 165)'}, {color: 'rgb(15, 156, 40)'}],
                        [0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, {color: 'rgb(71, 51, 251)'}, {color: 'rgb(198, 209, 145)'}, {color: 'rgb(129, 98, 5)'}],
                        [1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, {color: 'rgb(226, 19, 107)'}, {color: 'rgb(140, 205, 21)'}, {color: 'rgb(252, 1, 240)'}]
                    ]
                ];

            var el = document.createElement('span');
            el.style.width = '6px';
            el.style.height = '6px';
            el.style.backgroundColor = 'rgb(123, 108, 255)';
            el.style.position = 'absolute';
            el.style.display = 'block';
            el.style.border = '1px solid black';
            el.style.margin = '5px';

            var canvas = document.createElement('div');
            canvas.style.width = 'auto';
            canvas.style.border = '8px solid #f1f1f1';
            canvas.style.backgroundColor = '#fff';
            canvas.style.position = 'relative';

            document.body.appendChild(canvas);

            return {
                debug: false,
                canvas: canvas,
                matrix: matrix,
                // Grid
                autoResize: false,
                element: function () {
                    return el;
                },
                // Animation
                animation: false,
                duration: 1300,
                // Events
                events: {
                    onRender: null,
                    onIndex: null,
                    onAppendElement: null,
                    onClick: null
                }
            };
        },
        /**
         * Очистка места отрисовки матрицы
         */
        clear: function () {
            this.options.canvas.innerHTML = null;
        },
        r: function (frame) {
            var
                fc = this.options.matrix.length,
                f = 0;

            this.grid.matrix.each(function (index, x, y) {
                if (typeof index === "object") {
                    if (index.color !== null) {
                        index.el.style.backgroundColor = index.color;
                    }
                }

                if (index.print) {
                    index.el.style.opacity = 1.0;
                } else {
                    index.el.style.opacity = 0.0;
                }
            });

            if (this.options.animation) {

            }
        }
    };
    window.MatrixImage = MImage;
})
(window);