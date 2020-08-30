<?php


namespace App\MyTools;


use Intervention\Image\Facades\Image;

class Picture
{
    public static function Resize($id,$avatar,$width,$height,$path){
        $filename = $id . '.' . $avatar->getClientOriginalExtension();
        Image::make($avatar)->resize($width, $height, function($constraint){
            $constraint->aspectRatio();
        })->save( public_path($path . $filename ) );
        return $filename;
    }
}
