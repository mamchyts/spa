<?php

    $folders = [
        ['id' => 0, 'cnt' => '6', 'name' => 'Входящие',   'fa_class' => 'fa-envelope'],
        ['id' => 1, 'cnt' => '2', 'name' => 'Vk',         'fa_class' => 'fa-folder'],
        ['id' => 2, 'cnt' => '1', 'name' => 'facebook',   'fa_class' => 'fa-folder'],
        ['id' => 3, 'cnt' => '2', 'name' => 'Спам',       'fa_class' => 'fa-thumbs-down'],
        ['id' => 4, 'cnt' => '1', 'name' => 'Корзина',    'fa_class' => 'fa-trash'],
    ];

    echo json_encode($folders);
    exit();
?>