<?php


namespace App\MyTools;


class TagUtils
{
    public static function Tagtrim($Tags){
        $tags = explode(",", $Tags);//idの切り出し
        $tag_numbers = array();
        foreach ($tags as $key => $tag) {
            $num = substr(strstr($tag, '%'), 1);
            if ($num != false) {
                $tag_numbers[$key] = $num;
            }
        }
        $tag_numbers = array_unique($tag_numbers);//重複を消す
        return $tag_numbers;
    }

}
