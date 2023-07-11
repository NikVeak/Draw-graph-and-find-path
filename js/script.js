
//--------------------------------
// задание опций в в графе
var options = {
  interaction: { hover: true },
  manipulation: {
    enabled: false,
    addNode: false,
    addEdge: false
  },
  autoResize: true,
  height: '100%',
  width: '100%',
  nodes:
  {
    font: '15px arial'
  },
  edges:
  {
  }
};
//--------------------------------

// глобальные параметры
//--------------------------------
var count_node = 0;
var count_edge = 0;
var len_matrix = 0;
var nodes = new vis.DataSet();
var edges = new vis.DataSet();
var count_row = 0;
var count_column = 0;
var matrix_load = [];
var G = [[0]];
var flag_node = 0;
//--------------------------------

// основная функция
//--------------------------------
$(document).ready(function () {

  var container = document.getElementById('canvas');
  var data = { nodes: nodes, edges: edges };
  var network = new vis.Network(container, data, options)
  function dijkstra(graph, start) {

    //This contains the distances from the start node to all other nodes
    var distances = [];
    //Initializing with a distance of "Infinity"
    for (var i = 0; i < graph.length; i++) 
      distances[i] = Number.MAX_VALUE;
    //The distance from the start node to itself is of course 0
    distances[start] = 0;

    //This contains whether a node was already visited
    var visited = [];
    var res = [];
    var path = [];

    //While there are nodes left to visit...
    while (true) {
        // ... find the node with the currently shortest distance from the start node...
        var shortestDistance = Number.MAX_VALUE;
        var shortestIndex = -1;
        for (var i = 0; i < graph.length; i++) {
            //... by going through all nodes that haven't been visited yet
            if (distances[i] < shortestDistance && !visited[i]) {
                shortestDistance = distances[i];
                shortestIndex = i;
            }
        }

        console.log("Visiting node " + shortestDistance + " with current distance " + shortestDistance);

        if (shortestIndex === -1) {
          
          //alert("Нет пути !");
            // There was no node not yet visited --> We are done
            res.push(distances);
            return res;
        }

        //...then, for all neighboring nodes....
        for (var i = 0; i < graph[shortestIndex].length; i++) {
            //...if the path over this edge is shorter...
            if (graph[shortestIndex][i] !== 0 && distances[i] > distances[shortestIndex] + graph[shortestIndex][i]) {
                //...Save this path as new shortest path.
                distances[i] = distances[shortestIndex] + graph[shortestIndex][i];
                console.log("Updating distance of node " + i + " to " + distances[i]);
              }
        }
        // Lastly, note that we are finished with this node.
        visited[shortestIndex] = true;
        console.log("Visited nodes: " + visited);
        console.log("Currently lowest distances: " + distances);

    }
  }
  // добавление вершины
  //--------------------------------
  function addNode(id) {
    let node = {
      id: id,
      label: String(id + 1),
      font: '14px arial'
    };
    nodes.add(node);
  }
  //--------------------------------

  // добавление ребра
  //--------------------------------
  function addEdge(i, j, idedge) {
    console.log("id edge = ", idedge);
    let edge = {
      id: String(idedge),
      from: i,
      to: j,
      label: "1",
      arrows: "to",
      color: "white"
    };
    edges.add(edge);
  }
  //--------------------------------

  //--------------------------------
  // обновление таблицы
  function update_table(A) {
    $('table tr').remove();
    for (let i = 0; i < A.length; i++) {
      let row = $('<tr class="nodes_row" id="' + i + '"></tr>');
      for (let j = 0; j < A[i].length; j++) {
        let column = $('<td class="node_column" id="' + i + "" + j + '"></td>');
        let input_td = $('<input type="number" class="td_input" id="' + i + "" + j + '">');
        input_td.val(A[i][j]);
        column.append(input_td);
        row.append(column);
      }
      $('table').append(row);
    }
  }
  //--------------------------------
  //--------------------------------
  // предсоздание объектов(таблицы кнопок)
  var error = document.getElementById('error_count');
  $('<h3>Матрица весов</h3>').appendTo('#div_table').css({
    color: 'white'
  });
  $('#div_table').append('<table id="mytab"><tbody></tbody></table>');
  var find_path = document.getElementById('find_path');
  var update_matrix = document.getElementById('enterMatrix');
  var save_matrix = document.getElementById('saveMatrix');
  var input_matrix = document.getElementById('inputMatrix');
  var clear_button = document.getElementById('clearButton');
  var log = document.getElementById('log');
  var sum_path = document.getElementById('sum_path');
  var path_node = document.getElementById('path_node');
  //--------------------------------

  //-------------------------------
  // очистить поле
  clear_button.addEventListener('click', function () {
    nodes.clear();
    edges.clear();
    $('table tr').remove();
    G.length = 0;
    count_node = 0;
    len_matrix = 0;
    G = [[0]];
    path_node.innerHTML = "";
    sum_path.innerHTML = "";
  });
  //-------------------------------

  // сохранение матрицы в файл
  //--------------------------------
  save_matrix.addEventListener('click', function () {
    function download(content, fileName, contentType) {
      var a = document.createElement("a");
      var file = new Blob([JSON.stringify(content)], { type: contentType });
      a.href = URL.createObjectURL(file);
      a.download = fileName;
      a.click();
    }
    download(G, 'matrix.json', 'text/plain');
  });
  //--------------------------------

  //загрузка матрицы из файла
  //--------------------------------
  input_matrix.addEventListener('click', function () {
    var input, file, fr;
    if (typeof window.FileReader !== 'function') {
      alert("The file API isn't supported on this browser yet.");
      return;
    }

    input = document.getElementById('fileinput');
    if (!input) {
      alert("Um, couldn't find the fileinput element.");
    }
    else if (!input.files) {
      alert("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
      alert("Please select a file before clicking 'Load'");
    }
    else {
      file = input.files[0];
      fr = new FileReader();
      fr.onload = receivedText;
      fr.readAsText(file);
    }

    function receivedText(e) {
      G.length = 0;
      let lines = e.target.result;
      matrix_load = JSON.parse(lines);
      console.log(matrix_load);
      count_node = matrix_load.length;
      for (let c = 0; c < count_node; c++) {
        G[c] = new Array(count_node);
      }
      for (let i = 0; i < count_node; i++) {
        for (let j = 0; j < count_node; j++) {
          G[i][j] = Number(matrix_load[i][j]);
        }
      }
      update_table(G);
      flag_node = true;
      count_node = G.length;
    }
  });
  //--------------------------------

  //--------------------------------
  // обновление графа
  update_matrix.addEventListener('click', function () {
    nodes.clear();
    edges.clear();
    update_table(G);
    for (let i = 0; i < G.length; i++) {
      let node = {
        id: i,
        label: String(i + 1),
        font: '14px arial'
      };
      nodes.add(node);
      for (let j = 0; j < G[i].length; j++) {
        let idedge = String(i) + String(j);
        if (G[i][j] > 0) {
          let edge = {
            id: String(idedge),
            from: i,
            to: j,
            label: String(G[i][j]),
            arrows: "to",
            color: "white"
          };
          edges.add(edge);
        }
      }
    }
    network.setData({ nodes: nodes, edges: edges });
    network.redraw();
  });
  //--------------------------------

  //---------------------------------------
  // поиск кратчайшего пути
  find_path.addEventListener('click', function () {
    path_node.innerHTML = "";
    sum_path.innerHTML = "";
    var x0 = document.getElementById('x0').value - 1;
    var xn = document.getElementById('xn').value - 1;
    if (xn > count_node || x0 < 0 || xn < 0 || x0 > count_node) {
      alert("Введена не существующая вершина!");
      return 1;
    }

    if (x0 == xn) {
      alert("Введена таже вершина !");
      return 1;
    }
    console.log("x0 = ", x0);
    console.log("xn = ", xn);

    function doSmth(a) {
      for (var q = 1, i = 1; q < a.length; ++q) {
        if (a[q] !== a[q - 1]) {
          a[i++] = a[q];
        }
      }

      a.length = i;
      return a;
    }
    var res = dijkstra(G, x0);
    var d = res[0];
    var path = [];
    let end = xn;
    let k = 1;
    let weight = d[end];
    //path.push(xn+1);
    var res_path = [];
    var min_path = res[0][xn];
    if (min_path == Number.MAX_VALUE) {
      path_node.innerHTML += "Нет пути !";
      return 1;
    } else {
      while (end != x0)
      {
        for(let i = 0; i < d.length; i++)
        {
          if (G[i][end] != 0)
          {
            let temp = weight - G[i][end];
            if (temp == d[i])
            {
              weight = temp;
              end = i;
              path[k] = i+1;
              k++;
            }
          }
        }
      }
      for (let i = path.length; i >=0; i--)
      {
        res_path.push(path[i]);
      }
      res_path.push(xn+1);
      path_node.innerHTML += res_path;
      sum_path.innerHTML += min_path;
    }
    for (let c = 0; c < res_path.length; c++) {
      nodes.update([{ id: res_path[c] - 1, color: 'red' }]);
    }
  });
  //--------------------------------

  //--------------------------------
  var count_click = 0;// параметры для рисования ребра
  var first_node = 0;
  var second_node = 0;
  //-------------------------------

  // рисование ребра
  //-------------------------------------------
  network.on("click", function (params) {
    if (params['nodes'][0] != undefined) {
      count_click++;
      if (count_click == 1) {
        first_node = params['nodes'][0];
      }
      if (count_click == 2) {
        count_edge++;
        second_node = params['nodes'][0];
        console.log(first_node, second_node);
        let idedge = String(first_node) + String(second_node);
        let id_edge = String(first_node + 1) + String(second_node + 1);
        console.log(first_node, " ", second_node)
        log.innerHTML = "Добавлено ребро = " + id_edge;
        addEdge(first_node, second_node, idedge);
        for (let i = 0; i < G.length; i++) {
          for (let j = 0; j < G[i].length; j++) {
            if (first_node == i && second_node == j) {
              G[i][j] = 1;
            }
          }
        }
        update_table(G);
        first_node = 0;
        second_node = 0;
        count_click = 0;
      }
    }
  });
  //-------------------------------------------

  //--------------------------------
  // добавление вершины двойным кликом мыши левой кнопки 
  network.on("doubleClick", function (params) {
    if (count_node > 10) {
      alert("Вершин не может быть больше 10 !");
      return 1;
    }
    addNode(count_node);
    len_matrix++;
    log.innerHTML = "Добавлена вершина = " + (count_node + 1);
    if (flag_node)
    {
      len_matrix = G.length;
      let row_g = [];
      for (let i = 0; i < len_matrix; i++) {
        row_g.push(0);
      }
      G.push(row_g);  
      for (let i = 0; i <= len_matrix; i++)
      {
        G[i].push(0);
      }    
    }else{
      if (count_node == 0 && !flag_node) {
      } else {
        let row_g = [];
        for (let i = 0; i < len_matrix; i++) {
          row_g.push(0);
        }
        G.push(row_g);
        for (let i = 0; i < len_matrix - 1; i++) {
          G[i].push(0);
        }
      }
    }

    update_table(G);
    count_node++;
    network.redraw();
  });
  //--------------------------------

  //------------------------------------------
  // отслежвание перетаскивание вершины
  network.on("dragging", function (params) {
    count_click += 3;
  });
  network.on("dragEnd", function (params) {
    count_click = 0;
  });
  //------------------------------------------
  function deleteRowAndColumn(matrix, p)
  {
    var new_matrix = [];
    for (let i = 0; i < matrix.length; i++)
    {
      if (i != p)
      {
        new_matrix.push(matrix[i]);
      }
    }
    var res = [];
    for (let i = 0; i < new_matrix.length; i++)
    {
      var arr = [];
      for (let j = 0; j < new_matrix[i].length; j++)
      {
        if(j != p)
        {
          arr.push(new_matrix[i][j]);
        }
      }
      res.push(arr);
    }
    return res;
  }
  //-------------------------------------------
  function transpose(matrix) {
    const rows = matrix.length, cols = matrix[0].length;
    const grid = [];
    for (let j = 0; j < cols; j++) {
      grid[j] = Array(rows);
    }
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        grid[j][i] = matrix[i][j];
      }
    }
    return grid;
  }
  //--------------------------------
  // просмотр выделенного объекта на удаление
  network.on("select", function (params) {
    if (params['nodes'].length != 0) {
      log.innerHTML = "Выбрана вершина = " + (params['nodes'][0] + 1);
    } else if (params['edges'].length != 0) {
      log.innerHTML = "Выбрано ребро = " + (params['edges'][0]);
    }
    var down_node = {};
    $(document).off().on("keydown", function (e) {
      down_node[e.keyCode] = true;
      $('#' + params['nodes'][0]).detach();
    }).on('keyup', function (e) {
      if (down_node[46] && down_node[78]) {
        nodes.remove({ id: params['nodes'][0] });
        G = deleteRowAndColumn(G, params['nodes'][0]);
        update_table(G);
        count_node--;
        len_matrix--;
        log.innerHTML = "Удалена вершина = " + (params['nodes'][0] + 1);
      }
      else if (down_node[46] && down_node[69]) {
        edges.remove({ id: params['edges'][0] });
        G[Number(params['edges'][0].at(0))][Number(params['edges'][0].at(1))] = 0;
        update_table(G);
        log.innerHTML = "Удалено ребро = " + (params['edges'][0]);
      }
      down_node[e.keyCode] = false;
    });
    network.redraw();
  });
  //--------------------------------

  //--------------------------------
  //изменение веса ребра по правому нажатию мыши по выделенному объекту
  network.on("oncontext", function (params) {
    console.log("rebra = ", edges);
    console.log("change = ", params['edges'][0]);
    let id_edge = params['edges'][0];
    log.innerHTML = "Измененение ребра = " + (id_edge);
    var label = $('<label id="labelWeight">Изменить вес ребра</label>').css({
      marginTop: '30px'
    })
    var input = $('<input id="editWeight" type="number">').css({
      width: '100px',
      marginTop: '30px',
      marginLeft: '30px'
    });
    $('#canvas').append(label);
    $('#canvas').append(input);
    $(document).off().on("keydown", function (e) {
      let weight = 0;
      if (e.keyCode == 13) {
        weight = input.val();
        edges.update([{ id: params['edges'][0], label: String(weight) }]);
        log.innerHTML = "Вес ребра " + (params['edges'][0]) + " изменен на " + weight;
        $('#editWeight').detach();
        $('#labelWeight').detach();
        G[Number(params['edges'][0].at(0))][Number(params['edges'][0].at(1))] = Number(weight);
        update_table(G);
      }
    });
    network.redraw();
  });
  //--------------------------------

});


