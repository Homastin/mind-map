/*
 * mind-map  v2.1.2
 * Copyright (c) 2018 hongfajing bmsoft
 * Licensed same as jquery - MIT License
 * Date: 2018-08-20
 */

(function ($) {
  'use strict';
  var defaultOpts = {
    auth: false,
    url: '',
    method: '',
    onSelect: function (resp, rr) {
      console.log(resp);
    }
  };
  var currentNodeLevel = 0;
  var _options = undefined;
  var $body = undefined;

  $.fn.mindMap = function (opts) {
    var $tree = this;
    $tree.empty();
    _options = $.extend(true, {}, defaultOpts, opts);

    //点击空白处 收缩节点功能菜单
    $body = $('body');
    $body.off('hide-node').on('hide-node', function (e) {
      var $menusEle = $(this).find('.isSpread');
      var $nodeDetail = $(this).find('.active');

      if ($menusEle) {
        $menusEle.removeClass('isSpread');
        $menusEle.parent().next().hide(200);
      }
      if ($nodeDetail) {
        $nodeDetail.removeClass('active');
        $nodeDetail.parent().parent().next().hide(200);
      }
    });

    $body.on('click', function (event) {
      $(this).trigger('hide-node');
    });

    var $factorTypeContainer = $('<div class="factor-type-container"></div>');

    for (var j in _options.data) {
      for (var k in _options.data[j]) {
        _options.data[j][k].root = true;
        currentNodeLevel = 0
      }
      $factorTypeContainer.clone().append(initTree(_options.data[j])).appendTo($tree);
    }
  };

  //初始化树
  function initTree(data, isChanged) {
    var $ul = $('<ul class="branch-node-container"></ul>');
    var $li;
    currentNodeLevel++;
    if (currentNodeLevel > 2 && !isChanged) {
      $ul.addClass('hidden')
    }
    for (var i in data) {
      if (data[i].root) {
        $ul.addClass('trunk-node');
      } else {
        $ul.addClass('child-node');
      }

      $li = initNode(data[i]);
      //消除单节点 最后多出来的竖线
      if (data.length == 1) {
        $li.addClass('only-one-child-node')
      }
      $li.appendTo($ul);
    }
    return $ul;
  }

  //生成单个节点
  function initNode(node) {
    var $li = $('<li class="leaf-node-container"></li>');
    var $nodeContainer = $('<div class="node-container"></div>');
    var $nodeTitleContainer = $('<div class="node-title-container"></div>');
    var $showNodeContent = $('<div class="node-drop-content hidden"></div>');
    var $em = $('<em></em>');
    var $nodeDropContentBody = $('<div></div>');
    $showNodeContent.append($em).append($nodeDropContentBody);

    var $nodeTitleName = $('<div class="title-name layui-elip"></div>');
    var $tAEle = $('<a class="layui-elip" title="' + node.elementName + '" class="mindmap-link"></a>');
    $tAEle.text(node.elementName);

    var $unfoldBtn = $('<i class="unfold-btn"></i>');
    //生成当前节点的权限功能菜单

    var $menusIcon = $('<i class="menus-btn"></i>');
    var $showNodeMenusBox = $('<div class="node-menus-box hidden"></div>');
    var $menuListUl = $('<ul class="menus-list"></ul>');
    var $menuListItemLi = $('<li class="menus-list-item"></li>');
    var nodeMenus = _options.nodeMenus.slice(0);

    if (!node.permissionValue) {
      nodeMenus = nodeMenus.splice(nodeMenus.length - 1)
    }
    for (var k in nodeMenus) {
      (function (n) {
        $menuListItemLi.clone().on('click', function (e) {
          e.stopPropagation();
          var $menusEle = $('body').find('.isSpread');
          if ($menusEle) {
            $menusEle.removeClass('isSpread');
            $menusEle.parent().next().hide(200);
          }
          _options.onSelect.call(this, nodeMenus[n], node);
        }).text(nodeMenus[n].name).appendTo($menuListUl);
      })(k);
    }

    $showNodeMenusBox.append($menuListUl);

    //处理标题的title
    $nodeTitleName.append($unfoldBtn).append($tAEle).append($menusIcon);

    $nodeTitleContainer.append($nodeTitleName).append($showNodeMenusBox);
    $nodeContainer.append($nodeTitleContainer);

    //处理内容content
    if (node.root) {
      createRootNode(node.rootQNum).appendTo($nodeTitleContainer);
      $nodeContainer.addClass('root');
    }

    $showNodeContent.appendTo($nodeContainer);
    $nodeContainer.appendTo($li);

    //为查看节点详情icon 绑定事件
    $tAEle.on('click', function (event) {
      event.stopPropagation();
      if ($(this).hasClass('active')) {
        $(this).removeClass('active');
        $showNodeContent.hide(200);
        $nodeDropContentBody.empty();
      } else {
        $body.trigger('hide-node');
        $(this).addClass('active');
        _options.onDropDown.call(this, node, $(this));
        $showNodeContent.show(200);
      }
    });
    //树形节点折叠功能
    $unfoldBtn.on('click', function (event) {
      event.stopPropagation();
      var $that = $(this);
      $body.trigger('hide-node');
      var $currentNodeTitleContainer = $(this).parent().parent();

      if (!$currentNodeTitleContainer.hasClass('remove-end-line')) {
        $currentNodeTitleContainer.addClass('remove-end-line');
        $that.addClass('isFold');
      } else {
        $currentNodeTitleContainer.removeClass('remove-end-line');
        $that.removeClass('isFold');
      }
      $currentNodeTitleContainer.parent().next().animate({
        height: 'toggle'
      });
      var left = $(this).offset().left;
      console.log(left);

      if (left > 400) {
        $('html .layui-body').animate({
          scrollLeft: left + 150
        }, 500);
      }
    });


    //节点的功能菜单
    $menusIcon.on('click', function (event) {
      var top = $(this).offset().top;
      var left = $(this).offset().left;
      console.log(left);
      console.log(top);
      if (top > 400 || left > 1100) {
        $('html .layui-body').animate({
          scrollTop: top + 100,
          scrollLeft: left
        }, 500);
      }
      event.stopPropagation();
      if ($(this).hasClass('isSpread')) {
        $(this).removeClass('isSpread');
        $showNodeMenusBox.hide(200);
      } else {
        $body.trigger('hide-node');
        $(this).addClass('isSpread');
        $showNodeMenusBox.show(200);
      }
    });
    if (!isEmptyArr(node.childElements)) {
      //根据需求默认展开前两个节点
      if (currentNodeLevel >= 2 && !node.isChange) {
        $nodeTitleContainer.addClass('remove-end-line');
        $unfoldBtn.addClass('isFold');
      }

      var $ul = initTree(node.childElements, node.isChange);

      //判断当前树的节点是否超过两级  超过两级的部分收缩

      $ul.appendTo($li);

    } else {
      $li.addClass('no-child-node');
      (node.isChange && _options.method) && $nodeTitleContainer.addClass('focus-node');
    }
    return $li;
  }

  //判断当前值是否为数组和空数组
  function isEmptyArr(array) {
    return (array === undefined || array.length === 0);
  }

  function createRootNode(number) {
    var $nodeContentDesc = $('<div class="content-desc"></div>');
    var $cSpan = $('<span></span>');

    $cSpan.text('共' + number + '条');

    //处理内容content
    $nodeContentDesc.append($cSpan);

    return $nodeContentDesc;
  }

  //自定义表单序列化的函数
  $.fn.serializeJson = function () {
    var json = {};
    var array = this.serializeArray();
    $.each(array, function () {
      var name = this.name;
      var value = this.value;
      if (value == null || value == "") {
        return true;
      }
      var old = json[name];
      if (old) {
        if ($.isArray(old)) {
          old.push(value);
        } else {
          json[name] = [old, value];
        }
      } else {
        json[name] = [value];
      }
    });
    return json;
  };
})(jQuery);

