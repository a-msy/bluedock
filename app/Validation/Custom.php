<?php


namespace App\Validation;


class Custom
{
    public function validateKatakana($attribute, $value, $parameters){
        if (preg_match('/^[ァ-ヶー]+$/u', $value)) {
            return true;
        }
        return false;
    }
}
