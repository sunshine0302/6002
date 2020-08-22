<?php
// 连接函数
function con(){
 $link = mysqli_connect('127.0.0.1','root','root','test');
 if(!$link) die('失败了');
 return $link;
}

// 非查询的封装
function query($sql){
  $link = con();
  $res = mysqli_query($link,$sql);
  if($res){
    return 1;
  }else{
    return 2;
  }
}

// 查询的封装
function select($sql){
  $link = con();
  $res = mysqli_query($link,$sql);
  // 遍历结果集合
  $arr = [];
  while($str= mysqli_fetch_assoc($res)){
    $arr[] = $str;
  }
  //返回数组
  return $arr;
}
