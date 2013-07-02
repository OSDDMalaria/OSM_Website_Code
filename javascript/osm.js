//Twitter Parsers
String.prototype.parseURL = function () {
  "use strict";
  return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function (url) {
    return url.link(url);
  });
};

String.prototype.parseUsername = function () {
  "use strict";
  return this.replace(/[@]+[A-Za-z0-9-_]+/g, function (u) {
    var username = u.replace("@", "");
    return u.link("http://twitter.com/" + username);
  });
};

String.prototype.parseHashtag = function () {
  "use strict";
  return this.replace(/[#]+[A-Za-z0-9-_]+/g, function (t) {
    var tag = t.replace("#", "%23");
    return t.link("http://search.twitter.com/search?q=" + tag);
  });
};

function parseTwitterDate(str) {
  "use strict";
  var v = str.split(' ');
  return new Date(Date.parse(v[1] + " " + v[2] + ", " + v[5] + " " + v[3] + " UTC"));
}

function parseGithubDate(str) {
  "use strict";
  return new Date(Date.parse(str));
}

// End of Twitter parsers

function loadLatestTweets() {
  "use strict";
  var _url = 'https://osm-feeds.herokuapp.com/';

  $.ajax({
    cache: false,
    url: _url,
    dataType: 'jsonp',
    success: function(data){
      var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
      var numTweets = 5;
      var useTweetCount = Math.min(numTweets, data.length);

      $("#twitter-feed").empty();
      $("#mobile-twitter-feed").empty();

      for (var i = 0; i < useTweetCount; i++) {
        var tweet = data[i].text;
        var created = parseTwitterDate(data[i].created_at);
        var hours = created.getHours().toString();
        if (hours.length === 1) { hours = '0' + hours; }
        var minutes = created.getMinutes().toString();
        if (minutes.length === 1) { minutes = '0' + minutes; }
        var createdDate = created.getDate() + ' ' + monthNames[created.getMonth() + 1] + ' ' + created.getFullYear() + ' at ' + hours + ':' + minutes;

        tweet = tweet.parseURL().parseUsername().parseHashtag();
        tweet += '<div class="tweeter-info"><div class="uppercase bold"></div><div class="right"><a href="https://twitter.com/#!/OSDDMalaria/status/' + data[i].id_str + '">' + createdDate + '</a></div></div>';
        $("#twitter-feed").append('<p>' + tweet + '</p>');
        $("#mobile-twitter-feed").append('<p>' + tweet + '</p>');
      }
    }
  });
}

function loadLatestProjectActivity() {

  $("#project_activity_script").remove();

  var script = document.createElement( 'script' );
  script.type = 'text/javascript';
  script.src = "https://osm-feeds.herokuapp.com/project_activity?callback=projectActivity";
  script.id = "project_activity_script";
  $("head").append( script );
}

function projectActivity(data) {
  "use strict";
  var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
  var numGithubItems = 12;
  var lastGithubItem = Math.min(numGithubItems, data.length);
  $("#project-activity-feed").empty();

  for (var i = 0; i < lastGithubItem; i++) {
    var itemTitle = data[i].title;
    var itemBody = data[i].body;
    var itemLink = data[i].html_url;
    var commentCount = data[i].comments;
    var created = parseGithubDate(data[i].created_at);
    var hours = created.getHours().toString();
    if (hours.length === 1) { hours = '0' + hours; }
    var minutes = created.getMinutes().toString();
    if (minutes.length === 1) { minutes = '0' + minutes; }

    var createdDate = created.getDate() + ' ' + monthNames[created.getMonth() + 1] + ' ' + created.getFullYear() + ' at ' + hours + ':' + minutes;
    var commentText;

    if (commentCount > 0){
      if (commentCount === 1){
        commentText = "1 comment";
      } else {
        commentText = commentCount + ' comments';
      }
    } else {
      commentText = "";
    }

    $("#project-activity-feed").append('<span class="project-activity-item"><a href="' + itemLink + '" target="_blank"><img src="images/' + data[i].state + '.gif"' + 'class="project-activity-image"/><span class=title>' + createdDate + " | " + "<strong>" + itemTitle + '</strong></span></a></span>');
    $("#project-activity-feed").append('<div class="indented"><a href="' + itemLink + '" target="_blank">' + itemBody + '<strong><em>&nbsp;'+ commentText +'</em></strong>' + '</a></div>');
  }
}

function loadSponsorsAndTeam(){
  "use strict";
  $("#sponsors_and_members_script").remove();
  var script = document.createElement( 'script' );
  script.type = 'text/javascript';
  script.src = "https://osm-feeds.herokuapp.com/sponsors_and_members?callback=sponsorsAndMembers";
  script.id = 'sponsors_and_members_script'
  $("head").append( script );
}

function sponsorsAndMembers(data) {
  parseSponsors(data);
  parseTeam(data);
}

function parseSponsors(data) {
  "use strict";

    var perRow = 4;
    var rowPosition = 0;
    var numSponsors = 100;
    var currentRow = 0;
    var dataIndex = -1;

    for (i = 0; i < data.length; i++) {
      if (data[i].title === "sponsors") { dataIndex = i; }
    }

    if (dataIndex > -1) {
      $("#sponsors").empty();
      var sponsors = $.parseJSON(data[dataIndex].body);
      var lastSponsor = Math.min(numSponsors, sponsors.length);

      for (var i = 0; i < lastSponsor; i++) {
        var name = sponsors[i].name;
        var url = sponsors[i].url;
        name = sponsors[i].name ? sponsors[i].name : url;
        var image = sponsors[i].image;


        if (rowPosition === 0) { // starting a new row
          $("#sponsors").append('<div class="row-fluid sponsor-row" id="sponsorRow' + currentRow + '">');
        }

        var sponsor;
        if (url) {
          sponsor = '<span class="span3 sponsor-image"><a href="http://' + url + '" target="_blank"><img src="https://' + image + '" title="' + name + '"></a></span>';
        } else {
          sponsor = '<span class="span3"><img src="https://' + image + '"></span>';
        }

        $("#sponsorRow" + currentRow).append(sponsor);
        rowPosition++;
        if (rowPosition >= perRow) {
          $("#sponsorRow" + currentRow).append('</div>');
          rowPosition = 0;
          currentRow++;
        }
      }
    }
}

function parseTeam(data) {
  "use strict";
    var numTeamMembers = 100;
    var dataIndex = -1;

    for (i = 0; i < data.length; i++) {
      if (data[i].title === "team") { dataIndex = i; }
    }

    if (dataIndex > -1) {
      $("#team-members").empty();
      var teamMembers = $.parseJSON(data[dataIndex].body);
      var lastTeamMember = Math.min(numTeamMembers, teamMembers.length);
      for (var i = 0; i < lastTeamMember; i++) {
        var name = teamMembers[i].name || "Anonymous";
        var url = teamMembers[i].url;
        var gravatarEmail = teamMembers[i].gravatar_email;
        var affiliation;
        var affiliationWithComma;
        if (teamMembers[i].affiliation) {
          affiliation = teamMembers[i].affiliation;
          affiliationWithComma = ", " + affiliation;
        } else {
          affiliation = "";
          affiliationWithComma = "";
        }

        var gravatarUrl = getGravatar(gravatarEmail);

        var teamMember;
        if (url) {
          teamMember = '<span class="span2 member"><a href="http://' + url + '" target="_blank"><img src="' + gravatarUrl + '" title="' + name + affiliationWithComma + '"/>' + '</a>' +
            '<div><a href="http://' + url + '" target="_blank"><strong>' + name + '</strong></div><div class="affiliation"><small>' + affiliation + '</small></div></div></span>';
        } else {
          teamMember = '<span class="span2 member"><img src="' + gravatarUrl + '" title="' + name + affiliationWithComma + '"/><div><strong>' + name + '</strong></div><div class="affiliation"><small>' + affiliation + '</small></div></div></span>';
        }

        $("#team-members").append(teamMember);
      }
    }
}

function getGravatar(gravatarEmail, size) {
  "use strict";
  // MD5 (Message-Digest Algorithm) by WebToolkit
  var MD5 = function (s) {
    function L(k, d) {
      return(k << d) | (k >>> (32 - d));
    }

    function K(G, k) {
      var I, d, F, H, x;
      F = (G & 2147483648);
      H = (k & 2147483648);
      I = (G & 1073741824);
      d = (k & 1073741824);
      x = (G & 1073741823) + (k & 1073741823);
      if (I & d) {
        return(x ^ 2147483648 ^ F ^ H);
      }
      if (I | d) {
        if (x & 1073741824) {
          return(x ^ 3221225472 ^ F ^ H);
        } else {
          return(x ^ 1073741824 ^ F ^ H);
        }
      } else {
        return(x ^ F ^ H);
      }
    }

    function r(d, F, k) {
      return(d & F) | ((~d) & k);
    }

    function q(d, F, k) {
      return(d & k) | (F & (~k));
    }

    function p(d, F, k) {
      return(d ^ F ^ k);
    }

    function n(d, F, k) {
      return(F ^ (d | (~k)));
    }

    function u(G, F, aa, Z, k, H, I) {
      G = K(G, K(K(r(F, aa, Z), k), I));
      return K(L(G, H), F);
    }

    function f(G, F, aa, Z, k, H, I) {
      G = K(G, K(K(q(F, aa, Z), k), I));
      return K(L(G, H), F);
    }

    function D(G, F, aa, Z, k, H, I) {
      G = K(G, K(K(p(F, aa, Z), k), I));
      return K(L(G, H), F);
    }

    function t(G, F, aa, Z, k, H, I) {
      G = K(G, K(K(n(F, aa, Z), k), I));
      return K(L(G, H), F);
    }

    function e(G) {
      var Z;
      var F = G.length;
      var x = F + 8;
      var k = (x - (x % 64)) / 64;
      var I = (k + 1) * 16;
      var aa = Array(I - 1);
      var d = 0;
      var H = 0;
      while (H < F) {
        Z = (H - (H % 4)) / 4;
        d = (H % 4) * 8;
        aa[Z] = (aa[Z] | (G.charCodeAt(H) << d));
        H++;
      }
      Z = (H - (H % 4)) / 4;
      d = (H % 4) * 8;
      aa[Z] = aa[Z] | (128 << d);
      aa[I - 2] = F << 3;
      aa[I - 1] = F >>> 29;
      return aa;
    }

    function B(x) {
      var k = "", F = "", G, d;
      for (d = 0; d <= 3; d++) {
        G = (x >>> (d * 8)) & 255;
        F = "0" + G.toString(16);
        k = k + F.substr(F.length - 2, 2);
      }
      return k;
    }

    function J(k) {
      k = k.replace(/rn/g, "n");
      var d = "";
      for (var F = 0; F < k.length; F++) {
        var x = k.charCodeAt(F);
        if (x < 128) {
          d += String.fromCharCode(x);
        } else {
          if ((x > 127) && (x < 2048)) {
            d += String.fromCharCode((x >> 6) | 192);
            d += String.fromCharCode((x & 63) | 128);
          } else {
            d += String.fromCharCode((x >> 12) | 224);
            d += String.fromCharCode(((x >> 6) & 63) | 128);
            d += String.fromCharCode((x & 63) | 128);
          }
        }
      }
      return d;
    }

    var C = Array();
    var P, h, E, v, g, Y, X, W, V;
    var S = 7, Q = 12, N = 17, M = 22;
    var A = 5, z = 9, y = 14, w = 20;
    var o = 4, m = 11, l = 16, j = 23;
    var U = 6, T = 10, R = 15, O = 21;
    s = J(s);
    C = e(s);
    Y = 1732584193;
    X = 4023233417;
    W = 2562383102;
    V = 271733878;
    for (P = 0; P < C.length; P += 16) {
      h = Y;
      E = X;
      v = W;
      g = V;
      Y = u(Y, X, W, V, C[P + 0], S, 3614090360);
      V = u(V, Y, X, W, C[P + 1], Q, 3905402710);
      W = u(W, V, Y, X, C[P + 2], N, 606105819);
      X = u(X, W, V, Y, C[P + 3], M, 3250441966);
      Y = u(Y, X, W, V, C[P + 4], S, 4118548399);
      V = u(V, Y, X, W, C[P + 5], Q, 1200080426);
      W = u(W, V, Y, X, C[P + 6], N, 2821735955);
      X = u(X, W, V, Y, C[P + 7], M, 4249261313);
      Y = u(Y, X, W, V, C[P + 8], S, 1770035416);
      V = u(V, Y, X, W, C[P + 9], Q, 2336552879);
      W = u(W, V, Y, X, C[P + 10], N, 4294925233);
      X = u(X, W, V, Y, C[P + 11], M, 2304563134);
      Y = u(Y, X, W, V, C[P + 12], S, 1804603682);
      V = u(V, Y, X, W, C[P + 13], Q, 4254626195);
      W = u(W, V, Y, X, C[P + 14], N, 2792965006);
      X = u(X, W, V, Y, C[P + 15], M, 1236535329);
      Y = f(Y, X, W, V, C[P + 1], A, 4129170786);
      V = f(V, Y, X, W, C[P + 6], z, 3225465664);
      W = f(W, V, Y, X, C[P + 11], y, 643717713);
      X = f(X, W, V, Y, C[P + 0], w, 3921069994);
      Y = f(Y, X, W, V, C[P + 5], A, 3593408605);
      V = f(V, Y, X, W, C[P + 10], z, 38016083);
      W = f(W, V, Y, X, C[P + 15], y, 3634488961);
      X = f(X, W, V, Y, C[P + 4], w, 3889429448);
      Y = f(Y, X, W, V, C[P + 9], A, 568446438);
      V = f(V, Y, X, W, C[P + 14], z, 3275163606);
      W = f(W, V, Y, X, C[P + 3], y, 4107603335);
      X = f(X, W, V, Y, C[P + 8], w, 1163531501);
      Y = f(Y, X, W, V, C[P + 13], A, 2850285829);
      V = f(V, Y, X, W, C[P + 2], z, 4243563512);
      W = f(W, V, Y, X, C[P + 7], y, 1735328473);
      X = f(X, W, V, Y, C[P + 12], w, 2368359562);
      Y = D(Y, X, W, V, C[P + 5], o, 4294588738);
      V = D(V, Y, X, W, C[P + 8], m, 2272392833);
      W = D(W, V, Y, X, C[P + 11], l, 1839030562);
      X = D(X, W, V, Y, C[P + 14], j, 4259657740);
      Y = D(Y, X, W, V, C[P + 1], o, 2763975236);
      V = D(V, Y, X, W, C[P + 4], m, 1272893353);
      W = D(W, V, Y, X, C[P + 7], l, 4139469664);
      X = D(X, W, V, Y, C[P + 10], j, 3200236656);
      Y = D(Y, X, W, V, C[P + 13], o, 681279174);
      V = D(V, Y, X, W, C[P + 0], m, 3936430074);
      W = D(W, V, Y, X, C[P + 3], l, 3572445317);
      X = D(X, W, V, Y, C[P + 6], j, 76029189);
      Y = D(Y, X, W, V, C[P + 9], o, 3654602809);
      V = D(V, Y, X, W, C[P + 12], m, 3873151461);
      W = D(W, V, Y, X, C[P + 15], l, 530742520);
      X = D(X, W, V, Y, C[P + 2], j, 3299628645);
      Y = t(Y, X, W, V, C[P + 0], U, 4096336452);
      V = t(V, Y, X, W, C[P + 7], T, 1126891415);
      W = t(W, V, Y, X, C[P + 14], R, 2878612391);
      X = t(X, W, V, Y, C[P + 5], O, 4237533241);
      Y = t(Y, X, W, V, C[P + 12], U, 1700485571);
      V = t(V, Y, X, W, C[P + 3], T, 2399980690);
      W = t(W, V, Y, X, C[P + 10], R, 4293915773);
      X = t(X, W, V, Y, C[P + 1], O, 2240044497);
      Y = t(Y, X, W, V, C[P + 8], U, 1873313359);
      V = t(V, Y, X, W, C[P + 15], T, 4264355552);
      W = t(W, V, Y, X, C[P + 6], R, 2734768916);
      X = t(X, W, V, Y, C[P + 13], O, 1309151649);
      Y = t(Y, X, W, V, C[P + 4], U, 4149444226);
      V = t(V, Y, X, W, C[P + 11], T, 3174756917);
      W = t(W, V, Y, X, C[P + 2], R, 718787259);
      X = t(X, W, V, Y, C[P + 9], O, 3951481745);
      Y = K(Y, h);
      X = K(X, E);
      W = K(W, v);
      V = K(V, g);
    }
    var i = B(Y) + B(X) + B(W) + B(V);
    return i.toLowerCase();
  };

  size = size || 80;
  if (gravatarEmail) {
    return 'http://www.gravatar.com/avatar/' + MD5(gravatarEmail) + '.jpg?s=' + size;
  } else {
    return 'images/Gravatar.jpg';
  }

}