declare type DatanameChangedWhat = "" | "#COL" | "#LSEL" | "#L" | "#LSEL_ALL" | "#NCELL"

declare class ctrl_base {
    public mData: string | number | omnis_list
    /**
        This initializes the class, and must be called by the constructor.
        The default code should be left as is - it sets up the superclass.
        Use this method to
            - Initialize class variables.
     */
    init_class_inst(): void
    /**
     * Initializes the control instance from element attributes.
     * Must be called after control is constructed by the constructor.
     * Use this method to:
     *     - Read attributes from the element.
     *     - Read the $dataname data. <link to this.getData()>
     *     - Fine-tune/extend your control’s layout & appearance.
     *     - Setup event handlers. <link>
     *
     * @param form      Reference to the parent form.
     * @param elem      The html element the control belongs to.
     * @param rowCtrl   Pointer to a complex grid control if this control belongs to a cgrid.
     * @param rowNumber The row number this control belongs to if it belongs to a cgrid.
     * @returns {boolean}   True if the control is a container.
     */
    init_ctrl_inst(form, elem, rowCtrl, rowNumber): boolean

    /**
     * This method is called when the object is removed, typically when a form is closed.
     * You should override this function if there is some work to do prior to your control being deleted.
     * Make sure to end your call to this by calling the superclass version.
     * Implement this method to:
     *     Perform any custom clean-up when your control is destroyed.
     */
    delete_class_inst(): void

    /**
     * The control's data has changed. The contents may need to be updated.
     *
     * @param {String} what    Specifies which part of the data has changed:
     *                 ""              - The entire data has changed
     *                 "#COL"          - A single column in the $dataname list (specified by 'row' and 'col') or a row's column (specified by 'col')
     *                 "#LSEL"         - The selected line of the $dataname list has changed (specified by 'row')
     *                 "#L"            - The current line of the $dataname list has changed  (specified by 'row')
     *                 "#LSEL_ALL"     - All lines in the $dataname list have been selected.
     *                 "#NCELL"        - An individual cell in a (nested) list. In this case, 'row' is an array of row & column numbers.
     *                                  of the form "row1,col1,row2,col2,..."
     *
     * @param {Number} row             If specified, the row number in a list (range = 1..n) to which the change pertains.
     *                                 If 'what' is "#NCELL", this must be an array of row and col numbers. Optionally, a modifier may be
     *                                 added as the final array element, to change which part of the nested data is to be changed. (Currently only "#L" is supported)
     *
     * @param {Number|String} col      If specified, the column in a list row (range = 1..n or name) to which the change pertains.
     */
    updateCtrl(what: DatanameChangedWhat, row: number, col: number | string, mustUpdate): void

    /**
        Use this method to create a switch statement which returns true or false as to whether the passed property can be assigned to, if it’s a custom property (or a base property you wish to treat differently). Otherwise, let the superclass handle it.
        Implement this method to:
            Determine whether a custom property can be assigned to.

     * @param propNumber The Omnis property number.
     * @returns Whether the property can be assigned to.
     */
    getCanAssign(propNumber: number | string): boolean

    /**
    This is called when Omnis code attempts to get the value of a property of the control.
    If it is a custom property (or a base property you need to use special handling for), you should catch and handle this yourself. Otherwise, let the superclass handle it.
    The propNumbers of standard properties can be accessed via the eBaseProperties enumerated type.
    It is good practice to call this method from your JavaScript code when you want to get the value of a property.
    Implement this method to:
        Catch and handle requests for your custom properties, or properties you need to add special handling for.
    @param pPropNumber (Integer): The Omnis property number.
    @returns (Var): The value of the property.
    */
    getProperty(propNumber: number | string): any
    /**
    This is called when Omnis code attempts to set the value of a property of the control.
    If it is a custom property, you should catch and handle this yourself. Otherwise, let the superclass handle it for default properties.
    The propNumbers of standard properties can be accessed via the eBaseProperties enumerated type.
    It is good practice to call this method from your JavaScript code when you want to set a property.
    Implement this method to:
    - Catch and handle changes to your custom properties, or properties you need to add special handling for.
    - Begin by calling this.getCanAssign(pPropNumber), to respect rules set therein.

    ```
    ctrl.setProperty = function( propNumber, propValue ) {
    if (!this.getCanAssign(propNumber))
        return false;
    switch (propNumber) {
        case eBaseProperties.enabled:
        this.handleEnabled(propValue);
        return true;
    default:
        return this.superclass.setProperty.call( this, propNumber, propValue ); // call our superclass setProperty for other properties
    }
    };
    ```

    * @param propNumber The Omnis property number.
    * @param propValue The new value for the property.
    * @returns Whether the property was set successfully.
    */
    setProperty(propNumber: number | string, propValue: any): boolean

    /**
    Called when the size of the control has changed (e.g. due to a screen size change).
    Implement this method to:
        Add special handling for when the size of the control has changed
    */
    sizeChanged(): void

    /**
    This is called when an event handler which was assigned this.mEventFunction is triggered.
    Implement this method to:
        - Create a switch statement based on pEvent.type to handle multiple events.
        - If multiple elements in your control can trigger the same kind of event (e.g. "click"), you may like to use jOmnis.getEventCurrentTarget() to determine which element was clicked.
    @param pEvent (Object): The standard JavaScript event object, pertaining to this event.
     */
    handleEvent(pEvent: Event): void

    getClientElem: () => HTMLElement
    update: () => void
    mEventFunction: () => void
    usesTouch: boolean
    isEnabled: () => boolean
    lastTouch: number
    touchStartPos: {
        x: number
        y: number
    }
    canSendEvent: (evName: OmnisEventName) => boolean
    eventParamsAdd: (name: string, value: any) => void
    sendEvent: (event: any) => void
    getData(): any

    getTheme(): JOmnisTheme
}

/**
 * The omnis_list is the client-side representation of an Omnis list or row variable.
 */
declare class omnis_list {
    /**
     * Constructor for an omnis_list object.
     * @param omnisList Pass null to create a new, empty, omnis_list. Or pass an omnis_raw_list instance to create a copy of it.
     */
    constructor(omnisList: null | omnis_raw_list)
    /**
     * Returns character data for the specified column and row.
     * @param pCol  Can be either the column name, or the column number (1-indexed).
     * @param pRowNumber The row number (1-indexed). If zero, the current line will be used.
     * @param pZeroEmpty If true, zero values are returned as an empty string.
     */
    getChar(pCol: string | number, pRowNumber: number, pZeroEmpty: boolean): string

    /**
     * Returns the data in the cell specified by the column and row.
     * @param pCol  Can be either the column name, or the column number (1-indexed).
     * @param pRowNumber The row number (1-indexed). If zero, the current line will be used.
     */
    getData(pCol: string | number, pRowNumber: number): any

    /**
        Sets the data in the specified row and column.
        @param pCol (String or Integer): Can be either the column name, or the column number (1-indexed).
        @param pRowNumber (Integer): The row number (1-indexed). If empty or zero, the current line will be used.
        @param pNewData(Var): The new data to apply to the cell.
        @return(Boolean): Whether the new value was successfully applied.
     */
    setData(pCol: string | number, pRowNumber: number, pNewData: any): boolean

    /**
        Searches a column in the list and returns the first matching row.
        @param pCol (String or Integer): Can be either the column name, or the column number (1-indexed).
        @param pSearchValue (Var): The value to search for.
        @param pSetCurrentRow (Boolean): Whether the list's current row should be set to the returned row.
        @param pSelectMatches (Boolean): If true, all matching rows are selected.
        @param pDeselectNonMatches (Boolean): If true, all non-matching rows are de-selected.
        @returns (Integer): The first matching row number (1-indexed), or zero if no match is found.
     */
    search(
        pCol: string | number,
        pSearchValue: any,
        pSetCurrentRow: boolean,
        pSelectMatches: boolean,
        pDeSelectNonMatches: boolean
    ): number

    /**
     *
     * @param pRowNumber The row number (1-indexed). If zero, the current line will be used.
     * @readonly 1 or 0
     */
    getRowSelectionState(pRowNumber: number): 0 | 1
    /**
     *
     * @param pRowNumber
     * @param pNewSelectionState
     */
    setRowSelectionState(pRowNumber: number, pNewSelectionState: 0 | 1): boolean

    /**
     * Sets the selection state for all rows in a list.
     * @param pNewSelectionState
     */
    setRowSelectionStateAllRows(pNewSelectionState: 0 | 1): void

    /**
     * Returns the current row number for the list.
     */
    getCurrentRow(): number

    /**
     *
     * @param pNewCurrentRow
     */
    setCurrentRow(pNewCurrentRow: number): boolean

    /**
     * Gets the number of rows in the list.
     */
    getRowCount(): number

    /**
     * Gets the number of columns in the list.
     */
    getColumnCount(): number

    /**
    Adds an empty row to the list.
    Note that you can only add a row to a list (not a row).
    @param pBeforeRowNumber (Integer): The row number the new row will be inserted before. If 0, it will be added to the end of the list.
    @param pColumnCount (Integer): The initial number of columns for the new row.
    @returns (Integer): The row number of the newly added row, or INVALID_LIST_OPERATION (-1), if the action failed.
     */
    addRow(pBeforeRowNumber: number, pColumnCount: number): number

    /**
    Deletes the specified rows from the list.
    @private pActionOrRow (Integer): One of: Row number to delete. Or An eListDeleteRow enumerated type. (Current, Selected or Deselected members)
    @returns (Type): Row number deleted, or number of rows deleted for eListDeleteRow.Selected or Deselected action.
     */
    deleteRows(pActionOrRow: number): number

    /**
    ets the specified column's column number in the list or row.
    @parampCol (String or Integer): One of:
    The column number.
    The column name.
    The column number, prefixed by "C". E.g. "C4".
    @param pBeginsWith (Boolean): If true, it will return the first column whose name begins with the string passed in pCol. Defaults to false.
        @returns The column number (1-indexed)
    */
    findColumn(pCol: string | number, pBeginsWith?: boolean): number

    /**
     * Returns a row's data as an array. Each element of the array being a column of the row.
     * @param pRowNumber
     * @returns The row's data. Each element of the array corresponds to the value of a column in the row.
     */
    getRowArray(pRowNumber: number): any[]

    /**
     * Returns the raw list data (an omnis_raw_list object), from the list. This is needed to pass into many of the row/col methods.
     */
    getListData(): omnis_raw_list
}

declare class omnis_raw_list { }

declare type OmnisEventName = string | number // numero per le proprietà interne di Omnis, stringa per quelle user-defined

declare type OmnisPropName = string | number // numero per le proprietà interne di Omnis, stringa per quelle user-defined

declare var eBaseProperties: any
declare var eBaseEvent: any

declare var touchWithinRange: any

type OmnisRGBInt = number

declare class JOmnisEffects {
    /**
     * Adds a ripple effect to the passed element.
     * Only add once - once added, the ripple effect will be triggered whenever the element is clicked (or optional keys are pressed while it has focus).
     * @param elem The HTML element to apply the ripple to.
     * @param theme The theme instance to use to resolve themed colors.
     * @param hasContainer If true, the ripple is applied to the container element. If false, it is applied to elem.
     * @param elemColor The color of the element to which the ripple will be applied. A tinted color will be generated from this for the ripple (unless directColor is provided).
     * @param keys An array of keyboard key names, which should fire the ripple when pressed. E.g. ["Enter", " "]
     * @param keyElement The element which receives keyboard events. Defaults to elem.
     * @param directColor If specified, a color to apply directly to the ripple, rather than calculated from the 'elemColor'.
     */
    addRippleToElem(
        elem: HTMLElement,
        theme: any,
        hasContainer: boolean,
        elemColor: OmnisRGBInt,
        keys: string[],
        keyElement: HTMLElement,
        directColor: OmnisRGBInt
    ): JOmnisEffects

    /**
     * Updates the color of a previously created ripple element.
     * @param elem The HTML element which already has a ripple applied.
     * @param theme The theme instance to use to resolve themed colors.
     * @param elemColor The color of the element to which the ripple will be applied. A tinted color will be generated from this for the ripple (unless directColor is provided).
     * @param directColor If specified, a color to apply directly to the ripple, rather than calculated from the 'elemColor'.
     */
    setRippleColor(elem: HTMLElement, theme: any, elemColor: OmnisRGBInt, directColor: OmnisRGBInt): void
}
declare var jOmnisEffects: JOmnisEffects


declare class JOmnisTheme {
    COLORS: { "default": -1, "none": -2, "transparent": -3, "neutral": -2147483464, "neutralText": -2147483463, "primary": -2147483462, "primaryDark": -2147483461, "primaryLight": -2147483460, "primaryText": -2147483459, "primaryDarkText": -2147483458, "primaryLightText": -2147483457, "secondary": -2147483456, "secondaryDark": -2147483455, "secondaryLight": -2147483454, "secondaryText": -2147483453, "secondaryDarkText": -2147483452, "secondaryLightText": -2147483451, "error": -2147483450, "errorText": -2147483449, "background": -2147483448, "backgroundText": -2147483447, "surface": -2147483446, "surfaceText": -2147483445, "focusedRow": -2147483444, "focusedRowText": -2147483443, "border": -2147483442, "dialog": -2147483441, "dialogText": -2147483440, "dialogTitle": -2147483439, "dialogTitleText": -2147483438, "disabled": -2147483437, "disabledText": -2147483436, "focusIndicator": -2147483435 }
    COLOR_NAMES: { "none": "none", "transparent": "transparent", "neutral": "neutral", "neutralText": "neutralText", "primary": "primary", "primaryDark": "primaryDark", "primaryLight": "primaryLight", "primaryText": "primaryText", "primaryDarkText": "primaryDarkText", "primaryLightText": "primaryLightText", "secondary": "secondary", "secondaryDark": "secondaryDark", "secondaryLight": "secondaryLight", "secondaryText": "secondaryText", "secondaryDarkText": "secondaryDarkText", "secondaryLightText": "secondaryLightText", "error": "error", "errorText": "errorText", "background": "background", "backgroundText": "backgroundText", "surface": "surface", "surfaceText": "surfaceText", "focusedRow": "focusedRow", "focusedRowText": "focusedRowText", "border": "border", "dialog": "dialog", "dialogText": "dialogText", "dialogTitle": "dialogTitle", "dialogTitleText": "dialogTitleText", "disabled": "disabled", "disabledText": "disabledText", "focusIndicator": "focusIndicator" }

    /**
     * Gets string suitable for assigning to a css style
     * @param n The input color value (either an RGB Int or a Theme.COLORS constant).
     * @param defaultColor A default color to use, in the case that 'color' is kColorDefault or an unknown constant. Can also be a Theme.COLORS constant.
     * @param alpha  An alpha value between 0 and 1. Defaults to 1.
     * 
     * @returns An RGB color string
     */
    getColorString(n: number, defaultColor?: number, alpha?: number): string

    /**
     * Gets string suitable for assigning to a css style similar to getColorString() but automatically calculates the text color based on the onColor if textColor is kColorDefault and onColor is a theme color with an associated text color.
     * @param textColor The color (either an RGB integer or a Theme.COLORS constant) for the text.
     * @param onColor The background color on which the text will be displayed.
     * @param defaultColor The color to fall back to in the case that textColor is kColorDefault & onColor is not a valid theme color with associated text color.
     * @returns An RGB color string.
     */
    getTextColorString(textColor: number, onColor: number, defaultColor: number): string

    /**
     * Gets the resolved Omnis RGB Integer of the specified color (resolves color constants to their true RGB values).
     * @param color The input color value (either an Omnis RGB Int or a color constant)
     * @param defaultColor A default color to use, in the case that 'color' is kColorDefault or an unknown constant. Can also be a Theme.COLORS constant, but must not be kColorDefault (-1)
     * @returns An Omnis RGB Integer representing the color
     */
    getColorRGB(color: number, defaultColor?: number): number
}
declare var Theme: JOmnisTheme


declare class JOmnisIcons {

    /**
     * Gets the checked image URL corresponding to a normal image URL. According to icon set naming rules. (Previously a jOmnis method)
     * @param normalUrl The url to the normal (unchecked) image.
     * @returns The url to the checked version of the image
     */
    getCheckedImage(normalUrl: string): string

    /**
     * Returns the dimensions of the image, as a string suitable to be applied to an element’s background-size style value. I.e. “<width>px <height>px”
     * @param iconUrl The URL to the image.
     * @returns A string suitable to be applied to an element’s background-size style value. I.e. “<width>px <height>px”
     */
    getIconBackSize(iconUrl: string): string

    /**
     * Returns either an object with width and height members indicating the size of the icon for the url, or a CSS style to set the background size.

If pCssStyle is false, and the size is not available (such as for a stand-alone page not in an ICON set) returns an empty object.

The icon name must conform to Omnis Icon Set naming syntax.
     * @param iconUrl The url to the icon image
     * @param cssStyle  Whether to return a CSS style string. e.g. “background-size: 50px 80px;”
     * @param isSvg Either null (or omitted) meaning detect if SVG from iconUrl, or Boolean indicating if the image is SVG
     * @returns (String or Object): Either an object with width and height members indicating the size of the icon for the url or a CSS style to set the background size. If the size is not available (such as for a stand-alone page not in an ICON set), return an empty object:
        If pCssStyle=true, returns a CSS style string. e.g. “background-size: 50px 80px;”
        If pCssStyle=false, returns a JavaScript Object containing width and height properties.
     */
    getIconSize(iconUrl: string, cssStyle: boolean, isSvg?: boolean): string | object


    /**
     * Replaces if present, or adds if absent, an icon to an element.
     * @param parentElem The parent element to which the specified icon is to be added; if the parent already contains an icon it is replaced,otherwise this method adds the icon after any existing children in the parent.
     * @param iconUrl  The URL to the image.
     * @param loadFunc  The function to call when the image has loaded (null or omitted if onload is not required).
     * @param sizeObj If not null, a size object to override the size specified by the iconUrl
     * @param alwaysCreate  If true, always create and append (so we do not replace an existing element)
     * @returns The element being used for the icon or null if there is no icon or no useful icon URL
     */
    replaceOrAddToElem(parentElem: HTMLElement, iconUrl: string, loadFunc?: Function, sizeObj?: object, alwaysCreate?: boolean): HTMLElement
}

declare var jIcons: JOmnisIcons