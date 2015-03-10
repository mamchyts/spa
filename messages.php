<?php

    if($_SERVER['REQUEST_METHOD'] == 'GET'){
        $messages = [
            ['id' => 1, 'folder_id' => 1, 'from' => '123@asdaad.re (Иванов Иван)', 'html_date' => '18 фев', 'subject' => 'Lorem ipsum dolor sit amet',   'content' => 'Ipsam corrupti, quo! Consectetur dicta quis vel ad eos voluptate cumque voluptas qui iste, explicabo earum tenetur ut quae est quisquam aut'],
            ['id' => 3, 'folder_id' => 1, 'from' => 'asd@asdad.re (Иванов Иван)', 'html_date' => '18 дек', 'subject' => 'Dolor sit amet',   'content' => 'Ipsam corrupti, quo! Consectetur dicta quis vel ad eos voluptate cumque voluptas qui iste, explicabo earum tenetur ut quae est quisquam aut'],
            ['id' => 5, 'folder_id' => 4, 'from' => 'qw@asdaad.re (Иванов Иван)', 'html_date' => '17 фев', 'subject' => 'Lorem ipsum',     'content' => 'Ipsam corrupti, quo! Consectetur dicta quis vel ad eos voluptate cumque voluptas qui iste, explicabo earum tenetur ut quae est quisquam aut'],
            ['id' => 6, 'folder_id' => 8, 'from' => '2134ew@asd.re (Иванов Иван)', 'html_date' => '19 фев', 'subject' => 'Ipsum sit',     'content' => 'Ipsam corrupti, quo! Consectetur dicta quis vel ad eos voluptate cumque voluptas qui iste, explicabo earum tenetur ut quae est quisquam aut'],
            ['id' => 8, 'folder_id' => 8, 'from' => 'qweqw@a123d.re (Иванов Иван)', 'html_date' => '21 янв', 'subject' => 'Lorem amet',   'content' => 'Ipsam corrupti, quo! Consectetur dicta quis vel ad eos voluptate cumque voluptas qui iste, explicabo earum tenetur ut quae est quisquam aut'],
        ];


        if(!empty($_REQUEST['folder_id'])){
            $tmp = [];
            foreach ($messages as $m) {
                if($m['folder_id'] == $_REQUEST['folder_id']){
                    $tmp[] = $m;
                }
            }
            $messages = $tmp;
        }
        elseif(!empty($_REQUEST['message_id'])){
            $tmp = [];
            foreach ($messages as $m) {
                if($m['id'] == $_REQUEST['message_id']){
                    $tmp[] = $m;
                    break;
                }
            }
            $messages = $tmp;
        }
    }

    echo json_encode($messages);
    exit();
?>