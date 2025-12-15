<?php get_header(); ?>
<?php roulotte_breadcrumb(); ?>

<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
  <?php
  // Retrieve Meta Data
  $marca = get_post_meta(get_the_ID(), 'marca', true);
  $modello = get_post_meta(get_the_ID(), 'modello', true);
  $anno = get_post_meta(get_the_ID(), 'anno', true);
  $cond = get_post_meta(get_the_ID(), 'condizione', true);
  $prezzo = get_post_meta(get_the_ID(), 'prezzo', true);
  $listino = get_post_meta(get_the_ID(), 'prezzo_listino', true);
  $trattabile = get_post_meta(get_the_ID(), 'trattabile', true);
  $trasporto = get_post_meta(get_the_ID(), 'trasporto', true);
  $disponibile = get_post_meta(get_the_ID(), 'disponibile_da', true);
  
  // Tech Specs
  $posti = get_post_meta(get_the_ID(), 'posti_letto', true);
  $lunghezza = get_post_meta(get_the_ID(), 'lunghezza', true);
  $larghezza = get_post_meta(get_the_ID(), 'larghezza', true);
  $peso = get_post_meta(get_the_ID(), 'peso_massimo', true);
  $garanzia = get_post_meta(get_the_ID(), 'garanzia_mesi', true);

  // Features Lists (Assuming they are stored as comma separated string or array)
  // For this template, let's assume serialized array or we fetch from a custom table/field logic.
  // I will use a placeholder logic assuming standard WP meta.
  $accessori = get_post_meta(get_the_ID(), 'accessori', true); // Array or string
  if (is_string($accessori)) $accessori = explode(',', $accessori);
  
  // Group accessories logic (simplified PHP version of JS logic)
  $ext = []; $int = []; $tec = []; $others = [];
  if (is_array($accessori)) {
      foreach($accessori as $acc) {
          $acc = trim($acc);
          if (!$acc) continue;
          if (in_array($acc, ['Veranda','Tendalino','Mover','Stabilizzatore','Porta Bici','Pannello Solare','Cerchi Lega','Ruota Scorta','Piedini Rinforzati'])) $ext[] = $acc;
          elseif (in_array($acc, ['Climatizzatore','Stufa','Canalizzazione','Boiler','Frigo Grande','Forno','Microonde','Zanzariera Porta','Maxi Oblò'])) $int[] = $acc;
          elseif (in_array($acc, ['Antenna TV','TV','Impianto Audio','Prese USB','Inverter','Doccia Separata','WC Cassetta','Serbatoio Grigie','Attacco Acqua City'])) $tec[] = $acc;
          else $others[] = $acc;
      }
  }

  // Images
  $img_id = get_post_thumbnail_id(get_the_ID());
  $img_url = $img_id ? wp_get_attachment_image_url($img_id, 'full') : '';
  $img_srcset = $img_id ? wp_get_attachment_image_srcset($img_id, 'full') : '';
  $gallery_ids = get_post_meta(get_the_ID(), 'gallery_ids', true);
  $video_id = get_post_meta(get_the_ID(), 'video_id', true);
  ?>

  <div class="container">
    <div class="left-col">
      <div class="gallery-main">
        <?php if ($img_url) : ?>
            <img id="mainImg" src="<?php echo esc_url($img_url); ?>" srcset="<?php echo esc_attr($img_srcset); ?>" sizes="(max-width: 768px) 100vw, 800px" alt="<?php echo esc_attr($marca . ' ' . $modello); ?>" decoding="async" loading="eager">
        <?php else: ?>
            <div style="height:100%;display:flex;align-items:center;justify-content:center;color:#ccc">Nessuna foto</div>
        <?php endif; ?>
      </div>
      <div class="gallery-thumbs">
        <?php 
        // Render main image as first thumb
        if ($img_url) {
            echo '<div class="thumb" onclick="setMainImage(\'' . esc_url($img_url) . '\')"><img src="' . esc_url($img_url) . '"></div>';
        }
        if ($gallery_ids) {
            $ids = array_filter(array_map('trim', explode(',', $gallery_ids)));
            foreach ($ids as $aid) {
                $src = wp_get_attachment_image_url((int)$aid, 'thumbnail');
                $full = wp_get_attachment_image_url((int)$aid, 'full');
                $srcset = wp_get_attachment_image_srcset((int)$aid, 'full');
                if ($src && $full) {
                    echo '<div class="thumb" onclick="setMainImage(\'' . esc_url($full) . '\')"><img src="' . esc_url($src) . '" srcset="' . esc_attr($srcset) . '" sizes="90px"></div>';
                }
            }
        }
        ?>
      </div>
      <?php if ($video_id) : ?>
        <?php $video_url = wp_get_attachment_url((int)$video_id); ?>
        <?php if ($video_url) : ?>
          <div style="margin-top:1rem">
            <video controls style="width:100%" src="<?php echo esc_url($video_url); ?>"></video>
          </div>
        <?php endif; ?>
      <?php endif; ?>
      
      <h2 class="section-title">Descrizione</h2>
      <div class="description">
        <?php the_content(); ?>
      </div>
      
      <?php if (!empty($ext) || !empty($int) || !empty($tec) || !empty($others)) : ?>
        <h2 class="section-title">Accessori e Dotazioni</h2>
        <?php 
        $groups = [
            'Esterno & Telaio' => $ext,
            'Interno & Comfort' => $int,
            'Tecnologia & Bagno' => $tec,
            'Altro' => $others
        ];
        foreach ($groups as $title => $items) {
            if (!empty($items)) {
                echo '<h3 style="margin:1.5rem 0 0.5rem;font-size:1rem;color:var(--text-light);border-bottom:1px solid var(--border);padding-bottom:0.2rem">' . esc_html($title) . '</h3>';
                echo '<div class="tags">';
                foreach ($items as $item) {
                    echo '<span class="tag">' . esc_html($item) . '</span>';
                }
                echo '</div>';
            }
        }
        ?>
      <?php endif; ?>
      
    </div>
    
    <div class="right-col">
      <div class="product-header">
        <h1><?php echo esc_html($marca . ' ' . $modello); ?></h1>
        <div class="product-subtitle"><?php echo esc_html($anno); ?> · <?php echo esc_html($cond ? $cond : 'Usato'); ?></div>
      </div>
      
      <div class="price-card">
        <div class="price-label">Prezzo offerta</div>
        <div class="price-val">€ <?php echo number_format((float)$prezzo, 0, ',', '.'); ?></div>
        <?php if ($listino) : ?>
            <div class="price-old">Listino: € <?php echo number_format((float)$listino, 0, ',', '.'); ?></div>
        <?php endif; ?>
        
        <?php if ($trattabile) : ?>
            <div style="color:#059669;font-weight:600;margin-top:0.5rem">Prezzo trattabile</div>
        <?php endif; ?>
        
        <div style="margin-top:1rem;font-size:0.9rem;color:var(--text-light)">
          <?php echo $trasporto ? '✅ Possibilità di trasporto' : '❌ Ritiro in sede'; ?>
          <br>
          <?php echo $disponibile ? '📅 Disponibile dal ' . esc_html($disponibile) : '⚡ Pronta consegna'; ?>
        </div>
        <a href="mailto:info@roulotte.pro?subject=Info <?php echo esc_attr($marca . ' ' . $modello); ?>" class="cta-btn">Richiedi Informazioni</a>
      </div>
      
      <div class="specs-grid">
        <?php
        $specs = [
            ['label' => 'Posti letto', 'value' => $posti, 'icon' => '🛏️'],
            ['label' => 'Lunghezza', 'value' => $lunghezza ? $lunghezza . ' m' : '', 'icon' => '📏'],
            ['label' => 'Larghezza', 'value' => $larghezza ? $larghezza . ' m' : '', 'icon' => '↔️'],
            ['label' => 'Peso Max', 'value' => $peso ? $peso . ' kg' : '', 'icon' => '⚖️'],
            ['label' => 'Garanzia', 'value' => $garanzia ? $garanzia . ' Mesi' : '', 'icon' => '🛡️'],
        ];
        foreach ($specs as $spec) {
            if ($spec['value']) {
                echo '<div class="spec-box">';
                echo '<div class="spec-icon">' . $spec['icon'] . '</div>';
                echo '<div><span class="spec-label">' . esc_html($spec['label']) . '</span><span class="spec-val">' . esc_html($spec['value']) . '</span></div>';
                echo '</div>';
            }
        }
        ?>
      </div>
      
      <div style="background:#f1f5f9;padding:1.5rem;border-radius:12px">
        <h3 style="margin-top:0">Finanziamento</h3>
        <p style="font-size:0.9rem;color:var(--text-light)">Possibilità di finanziamento personalizzato fino a 120 mesi. Contattaci per un preventivo su misura.</p>
      </div>
    </div>
  </div>

  <script>
    function setMainImage(url) {
      document.getElementById('mainImg').src = url;
    }
  </script>

  <?php
    $priceVal = (float)$prezzo ?: 0;
    $condMap = $cond==='Nuovo' ? 'https://schema.org/NewCondition' : ($cond==='Km0' ? 'https://schema.org/UsedCondition' : 'https://schema.org/UsedCondition');
    $images = [];
    if ($img_url) $images[] = $img_url;
    if (!empty($gallery_ids)) {
      $ids = array_filter(array_map('trim', explode(',', $gallery_ids)));
      foreach ($ids as $aid) {
        $full = wp_get_attachment_image_url((int)$aid, 'full');
        if ($full) $images[] = $full;
      }
    }
    $product = [
      '@context' => 'https://schema.org/',
      '@type' => 'Product',
      'name' => trim(($marca ?: '').' '.($modello ?: '')),
      'brand' => [ '@type'=>'Brand', 'name' => $marca ?: '' ],
      'description' => wp_strip_all_tags(get_the_content('')), 
      'image' => $images,
      'sku' => (string)get_the_ID(),
      'category' => 'Caravan',
      'offers' => [
        '@type' => 'Offer',
        'priceCurrency' => 'EUR',
        'price' => $priceVal,
        'availability' => !empty($disponibile) ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock',
        'url' => get_permalink(),
        'itemCondition' => $condMap
      ]
    ];
  ?>
  <script type="application/ld+json">
    <?php echo wp_json_encode($product, JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE); ?>
  </script>

<?php endwhile; endif; ?>

<?php get_footer(); ?>
