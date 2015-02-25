<?php

    $folders = [
        ['id' => 0, 'name' => 'Входящие',   'fa_class' => 'fa-envelope'],
        ['id' => 4, 'name' => 'Vk',         'fa_class' => 'fa-folder'],
        ['id' => 1, 'name' => 'facebook',   'fa_class' => 'fa-folder'],
        ['id' => 8, 'name' => 'Спам',       'fa_class' => 'fa-thumbs-down'],
        ['id' => 9, 'name' => 'Корзина',    'fa_class' => 'fa-trash'],
    ];

    echo json_encode($folders);
    exit();
?>