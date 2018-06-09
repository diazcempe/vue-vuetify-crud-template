<template>
    <v-container>
        <h1 id="introduction" class="display-1 primary--text">
            <div>
                <p>Cities</p>
            </div>
        </h1>

        <v-dialog v-model="dialog" max-width="500px">
            <v-btn slot="activator" color="primary" dark class="mb-2">+ Add City</v-btn>
            <v-card>
                <v-card-title>
                    <span class="headline">{{ formTitle }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12 sm2 md2>
                                <v-text-field v-model="editedItem.id" label="ID"></v-text-field>
                            </v-flex>
                            <v-flex xs12 sm10 md10>
                                <v-text-field v-model="editedItem.name" label="City name"></v-text-field>
                            </v-flex>
                            <v-flex xs12 sm6 md6>
                                <v-select
                                    :items="regionOptions"
                                    v-model="editedItem.region"
                                    label="Region"
                                    autocomplete
                                ></v-select>
                            </v-flex>
                            <v-flex xs12 sm6 md6>
                                <v-text-field v-model="editedItem.population" label="Population"></v-text-field>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" flat @click.native="close">Cancel</v-btn>
                    <v-btn color="blue darken-1" flat @click.native="save">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-card>
            <v-card-title>
                Cities
                <v-spacer></v-spacer>
                <v-text-field
                    v-model="search"
                    append-icon="search"
                    label="Search"
                    single-line
                    hide-details></v-text-field>
            </v-card-title>

            <v-data-table 
                v-model="selected"
                :headers="headers"
                :items="items"
                :search="search"
                select-all
                item-key="name"
                class="elevation-1">
                <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
                <template slot="items" slot-scope="props">
                    <tr :active="props.selected">
                        <td>
                            <v-checkbox v-model="props.selected" primary hide-details></v-checkbox>
                        </td>
                        <td>{{ props.item.id }}</td>
                        <td><i @click="props.expanded = !props.expanded" style="cursor: pointer">{{ props.item.name }}</i></td>
                        <td>{{ props.item.region }}</td>
                        <td>{{ props.item.population }}</td>
                        <td class="justify-center layout px-0">
                            <v-btn icon class="mx-0" @click="editItem(props.item.firebaseId)">
                                <v-icon color="teal">edit</v-icon>
                            </v-btn>
                            <v-btn icon class="mx-0" @click="deleteItem(props.item.firebaseId)">
                                <v-icon color="pink">delete</v-icon>
                            </v-btn>
                        </td>
                    </tr>
                </template>
                <template slot="expand" slot-scope="props">
                    <v-card flat>
                        <v-card-text>{{ props.item.name }}</v-card-text>
                    </v-card>
                </template>
            </v-data-table>
        </v-card>
    </v-container>
</template>

<script>
    import axios from '../../axios-custom'

    export default {
        data () {
            return {
                // dialog related
                dialog: false,
                editedIndex: -1,
                regionOptions: [],
                editedItem: {
                    id: 0,
                    name: '',
                    region: '',
                    population: 0
                },
                defaultItem: {
                    id: 0,
                    name: '',
                    region: '',
                    population: 0
                },
                origItem: {},
                // table related
                search: '',
                selected: [],
                headers: [
                    { text: 'ID', value: 'id', align: 'left', sortable: false },
                    { text: 'City Name', value: 'name' },
                    { text: 'Region', value: 'region' },
                    { text: 'Population', value: 'population' },
                    { text: '', value: 'name', sortable: false }
                ],
                items: []
            }
        },
        computed: {
            formTitle () {
                return this.editedIndex === -1 ? 'Add Item' : 'Edit Item'
            }
        },
        watch: {
            dialog (val) {
                val || this.close()
            }
        },
        methods: {
            initialize() {
                axios.get('/cities.json')
                    .then(res => {
                        const resultArray = [];
                        for (let key in res.data){
                            res.data[key].firebaseId = key; // add firebaseId prop to the data for delete/edit purposes
                            resultArray.push(res.data[key]);
                        };
                        this.items = resultArray;
                    })
                    .catch(error => console.log(error));
            },
            fetchRegionDropdown() {
                return axios.get('/regions.json')
                            .then(res => {
                                const resultArray = [];
                                for (let key in res.data){                                
                                    res.data[key].firebaseId = key; // add firebaseId prop to the data for delete/edit purposes
                                    resultArray.push(res.data[key]);
                                };                                
                                this.regionOptions = resultArray.map(d => ({ value: d.name, text: d.name }));                                
                            })
                            .catch(error => console.log(error));
            },
            editItem (firebaseId) {
                axios.get(`/cities/${firebaseId}.json`)
                    .then(res => {
                        this.editedIndex = firebaseId.length;
                        this.editedItem = Object.assign({}, res.data);
                        this.editedItem.firebaseId = firebaseId; // add firebaseId prop to the data for edit purposes
                        this.origData = Object.assign({}, res.data); // for form reset
                        this.dialog = true;
                    })
                    .catch(error => console.log(error));
            },
            deleteItem (firebaseId) {
                confirm('Are you sure you want to delete this item?') && 
                axios.delete(`/cities/${firebaseId}.json`)
                    .then(res => this.initialize())
                    .catch(error => console.log(error))
            },
            close () {
                this.dialog = false
                setTimeout(() => {
                    this.editedItem = Object.assign({}, this.defaultItem)
                    this.editedIndex = -1
                }, 300)
            },
            save () {
                if (this.editedIndex > -1) {
                    axios.put(`/cities/${this.editedItem.firebaseId}.json`, this.editedItem)
                        .then(res => {
                            this.initialize();
                            this.close();
                        })
                        .catch(error => console.log(error));
                }
                else {
                    axios.post('/cities.json', this.editedItem)
                        .then(res => {
                            this.initialize();
                            this.close();
                        }) 
                        .catch(error => console.log(error));
                }
            }
        },
        created () {
            this.initialize();
            this.fetchRegionDropdown();
        }
    }
</script>