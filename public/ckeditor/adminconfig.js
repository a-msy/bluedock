/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.editorConfig = function( config ) {
    // Define changes to default configuration here.
    // For complete reference see:
    // https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_config.html

    // The toolbar groups arrangement, optimized for two toolbar rows.
    config.toolbarGroups = [
        { name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
        { name: 'links' },
        { name: 'forms' },
        { name: 'tools' },
        { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
        { name: 'styles' },
        { name: 'colors' },
        { name: 'about' }
    ];
    config.image_previewText = ' ';
    // Remove some buttons provided by the standard plugins, which are
    // not needed in the Standard(s) toolbar.

    // Set the most common block elements.
    config.format_tags = 'p;h1;h2;h3;pre';

    // Simplify the dialog windows.
    config.removeDialogTabs = 'image:advanced;link:advanced';
};
