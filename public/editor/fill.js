

function floodFill(canvas, x, y, color, tolerance) {
    let npx, stack = [{ x: x, y: y }],
        pxs = canvas.imageData,
        lcoords = (y * canvas.width + x) * 4,
        originColor = {
            r: pxs.data[lcoords],
            g: pxs.data[lcoords + 1],
            b: pxs.data[lcoords + 2],
            a: pxs.data[lcoords + 3]
        };

    while (stack.length > 0) {
        console.log(stack.length, stack, lcoords);
        npx = stack.shift();
        x = npx.x;
        y = npx.y;
        lcoords = (y * canvas.width + x) * 4;
        while (y-- >= 0 &&
            (pxs.data[lcoords] == originColor.r &&
                pxs.data[lcoords + 1] == originColor.g &&
                pxs.data[lcoords + 2] == originColor.b &&
                pxs.data[lcoords + 3] == originColor.a)) {
            lcoords -= canvas.width * 4;
        }
        lcoords += canvas.width * 4;
        y++;

        var atLeft = false,
            atRight = false;
        while (y++ < canvas.height &&
            (pxs.data[lcoords] == originColor.r &&
                pxs.data[lcoords + 1] == originColor.g &&
                pxs.data[lcoords + 2] == originColor.b &&
                pxs.data[lcoords + 3] == originColor.a)) {
            pxs.data[lcoords] = color.r;
            pxs.data[lcoords + 1] = color.g;
            pxs.data[lcoords + 2] = color.b;
            pxs.data[lcoords + 3] = color.a;

            if (x > 0) {
                let matched = colorMatch({
                    r: pxs.data[lcoords - 4],
                    g: pxs.data[lcoords - 3],
                    b: pxs.data[lcoords - 2],
                    a: pxs.data[lcoords - 1]
                }, color, tolerance);
                if (matched) {
                    if (!atLeft) {
                        stack.push({ x: x - 1, y: y });
                        atLeft = true;
                    }
                } else if (atLeft) {
                    atLeft = false;
                }
            }

            if (x < canvas.width - 1) {
                let matched = colorMatch({
                        r: pxs.data[lcoords + 4],
                        g: pxs.data[lcoords + 4 + 1],
                        b: pxs.data[lcoords + 4 + 2],
                        a: pxs.data[lcoords + 4 + 3]
                    }, originColor, tolerance
                )
                if (matched) {
                    if (!atRight) {
                        stack.push({ x: x + 1, y: y });
                        atRight = true;
                    }
                } else if (atRight) atRight = false;
            }

            lcoords += canvas.width * 4;
        }
    }
    return pxs
}

function colorMatch(color1, color2, delta) {
    let res = (
        color1.r >= color2.r - delta &&
        color1.r <= color2.r + delta &&
        color1.g >= color2.g - delta &&
        color1.g <= color2.g + delta &&
        color1.b >= color2.b - delta &&
        color1.b <= color2.b + delta
    );
    console.log(res)
    return res;
}

function inStack(x, y, stack) {
    for (var i = 0; i < stack.length; i++) {
        if (stack[i].x == x && stack[i].y == y) {
            return true;
        }
    }
    return false;
}
// adapted from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function conv(color) {
    color = color.replace("#", "");
    var bigint = parseInt(color, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return {
        r: r,
        g: g,
        b: b,
        a: 255
    };
}

onmessage = function (e) {
    var data = e.data;
    var pixelData = floodFill(data.canvas, data.color, data.x, data.y, data.delta);
    postMessage(pixelData);
}